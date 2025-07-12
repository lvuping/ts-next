import { getDb } from '@/lib/db';
import type { Note } from '@/types/note';

interface NotesFilter {
  search?: string;
  category?: string;
  tag?: string;
  favorite?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export async function getAllNotesStream(
  filters: NotesFilter,
  onChunk: (chunk: string) => Promise<void>
): Promise<void> {
  const db = getDb();
  const {
    search,
    category,
    tag,
    favorite,
    sortBy = 'updatedAt',
    sortOrder = 'desc',
    limit = 1000,
    offset = 0,
  } = filters;

  let query = `
    SELECT n.*, 
           c.name as category_name, 
           c.color as category_color,
           c.icon as category_icon,
           GROUP_CONCAT(t.name) as tags
    FROM notes n
    LEFT JOIN categories c ON n.category_id = c.id
    LEFT JOIN note_tags nt ON n.id = nt.note_id
    LEFT JOIN tags t ON nt.tag_id = t.id
  `;
  
  const conditions: string[] = [];
  const params: Record<string, string | number> = {};
  
  if (search) {
    conditions.push(`(n.title LIKE :search OR n.content LIKE :search)`);
    params.search = `%${search}%`;
  }
  
  if (category) {
    conditions.push(`c.name = :category`);
    params.category = category;
  }
  
  if (tag) {
    conditions.push(`n.id IN (
      SELECT note_id FROM note_tags 
      JOIN tags ON note_tags.tag_id = tags.id 
      WHERE tags.name = :tag
    )`);
    params.tag = tag;
  }
  
  if (favorite !== undefined) {
    conditions.push(`n.favorite = :favorite`);
    params.favorite = favorite ? 1 : 0;
  }
  
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }
  
  query += ` GROUP BY n.id`;
  
  // Add sorting
  const validSortColumns = {
    createdAt: 'n.created_at',
    updatedAt: 'n.updated_at',
    title: 'n.title'
  };
  
  const sortColumn = validSortColumns[sortBy] || 'n.updated_at';
  const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';
  query += ` ORDER BY ${sortColumn} ${sortDirection}`;
  
  // Add pagination
  query += ` LIMIT :limit OFFSET :offset`;
  params.limit = limit;
  params.offset = offset;

  // Stream header
  await onChunk('{"notes":[');

  let isFirst = true;

  // Execute query with streaming
  const stmt = db.prepare(query);
  const rows = stmt.all(params) as Array<{
    id: string;
    title: string;
    content: string;
    language: string;
    category_id: number;
    category_name: string;
    category_color: string;
    category_icon: string;
    tags: string;
    favorite: number;
    created_at: string;
    updated_at: string;
  }>;

  // Process rows in chunks for better streaming performance
  const chunkSize = 10;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, Math.min(i + chunkSize, rows.length));
    
    for (const row of chunk) {
      const note: Note = {
        id: row.id,
        title: row.title,
        content: row.content,
        language: row.language,
        category: row.category_name || '',
        tags: row.tags ? row.tags.split(',') : [],
        favorite: row.favorite === 1,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };

      if (!isFirst) {
        await onChunk(',');
      }
      await onChunk(JSON.stringify(note));
      isFirst = false;
    }
  }

  // Get total count for pagination
  const countQuery = `
    SELECT COUNT(DISTINCT n.id) as count
    FROM notes n
    LEFT JOIN categories c ON n.category_id = c.id
    LEFT JOIN note_tags nt ON n.id = nt.note_id
    LEFT JOIN tags t ON nt.tag_id = t.id
    ${conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''}
  `;
  
  const countResult = db.prepare(countQuery).get(params) as { count: number };
  const total = countResult.count;

  // Stream footer with metadata
  await onChunk(`],"total":${total},"limit":${limit},"offset":${offset}}`);
}