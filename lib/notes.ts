import type { Note, NoteInput, NoteTemplate } from '@/types/note';
import { getDb, migrateFromJson } from './db';
import Database from 'better-sqlite3';

interface NoteRow {
  id: string;
  title: string;
  content: string;
  contentFormat: string | null;
  language: string;
  category: string;
  favorite: number;
  createdAt: string;
  updatedAt: string;
  folderId: string | null;
  template: string | null;
  tags: string | null;
  relatedNotes: string | null;
  summary: string | null;
}

const templates: NoteTemplate[] = [
  {
    id: 'react-component',
    name: 'React Component',
    description: 'Basic React functional component with TypeScript',
    language: 'typescript',
    content: `import React from 'react';

interface Props {
  // Define your props here
}

export default function ComponentName({ }: Props) {
  return (
    <div>
      {/* Your component content */}
    </div>
  );
}`,
    category: 'Frontend'
  },
  {
    id: 'express-route',
    name: 'Express Route',
    description: 'Basic Express.js route handler',
    language: 'javascript',
    content: `router.get('/path', async (req, res) => {
  try {
    // Your route logic here
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});`,
    category: 'Backend'
  },
  {
    id: 'sql-query',
    name: 'SQL Query',
    description: 'Basic SQL query template',
    language: 'sql',
    content: `SELECT 
  column1,
  column2,
  COUNT(*) as count
FROM table_name
WHERE condition = true
GROUP BY column1, column2
ORDER BY count DESC
LIMIT 10;`,
    category: 'Database'
  }
];

let dbInstance: Database.Database | null = null;

function initDb() {
  if (!dbInstance) {
    dbInstance = getDb();
    migrateFromJson(dbInstance);
  }
  return dbInstance;
}

export async function getAllNotes(filters?: {
  search?: string;
  category?: string;
  tag?: string;
  favorite?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}): Promise<{ notes: Note[]; total: number }> {
  const db = initDb();
  
  let query = `
    SELECT DISTINCT
      n.id,
      n.title,
      n.content,
      n.content_format as contentFormat,
      n.language,
      n.category,
      n.favorite,
      n.created_at as createdAt,
      n.updated_at as updatedAt,
      n.folder_id as folderId,
      n.template,
      n.summary,
      GROUP_CONCAT(DISTINCT t.name) as tags,
      GROUP_CONCAT(DISTINCT rn.related_note_id) as relatedNotes
    FROM notes n
    LEFT JOIN note_tags nt ON n.id = nt.note_id
    LEFT JOIN tags t ON nt.tag_id = t.id
    LEFT JOIN related_notes rn ON n.id = rn.note_id
  `;
  
  const conditions: string[] = [];
  const params: unknown[] = [];
  
  if (filters?.search) {
    conditions.push('(n.title LIKE ? OR n.content LIKE ?)');
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }
  
  if (filters?.category) {
    conditions.push('n.category = ?');
    params.push(filters.category);
  }
  
  if (filters?.tag) {
    conditions.push('t.name = ?');
    params.push(filters.tag);
  }
  
  if (filters?.favorite !== undefined) {
    conditions.push('n.favorite = ?');
    params.push(filters.favorite ? 1 : 0);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' GROUP BY n.id';
  
  const sortBy = filters?.sortBy || 'createdAt';
  const sortOrder = filters?.sortOrder || 'desc';
  const sortColumn = sortBy === 'createdAt' ? 'n.created_at' : 
                     sortBy === 'updatedAt' ? 'n.updated_at' : 'n.title';
  
  query += ` ORDER BY ${sortColumn} ${sortOrder.toUpperCase()}`;
  
  // Add pagination
  const limit = filters?.limit || 50; // Default limit of 50
  const offset = filters?.offset || 0;
  query += ` LIMIT ${limit} OFFSET ${offset}`;
  
  const rows = db.prepare(query).all(...params) as NoteRow[];
  
  // Get total count for pagination
  let countQuery = `
    SELECT COUNT(DISTINCT n.id) as total
    FROM notes n
    LEFT JOIN note_tags nt ON n.id = nt.note_id
    LEFT JOIN tags t ON nt.tag_id = t.id
  `;
  
  if (conditions.length > 0) {
    countQuery += ' WHERE ' + conditions.join(' AND ');
  }
  
  const countResult = db.prepare(countQuery).get(...params) as { total: number };
  const total = countResult.total;
  
  const notes = rows.map(row => ({
    id: row.id,
    title: row.title,
    content: row.content,
    language: row.language,
    category: row.category,
    tags: row.tags ? row.tags.split(',') : [],
    favorite: row.favorite === 1,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    folderId: row.folderId || undefined,
    template: row.template || undefined,
    relatedNotes: row.relatedNotes ? row.relatedNotes.split(',') : [],
    summary: row.summary || undefined
  }));
  
  return { notes, total };
}

export async function getNoteById(id: string): Promise<Note | null> {
  const db = initDb();
  
  const row = db.prepare(`
    SELECT 
      n.id,
      n.title,
      n.content,
      n.content_format as contentFormat,
      n.language,
      n.category,
      n.favorite,
      n.created_at as createdAt,
      n.updated_at as updatedAt,
      n.folder_id as folderId,
      n.template,
      n.summary,
      GROUP_CONCAT(DISTINCT t.name) as tags,
      GROUP_CONCAT(DISTINCT rn.related_note_id) as relatedNotes
    FROM notes n
    LEFT JOIN note_tags nt ON n.id = nt.note_id
    LEFT JOIN tags t ON nt.tag_id = t.id
    LEFT JOIN related_notes rn ON n.id = rn.note_id
    WHERE n.id = ?
    GROUP BY n.id
  `).get(id) as NoteRow | undefined;
  
  if (!row) return null;
  
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    contentFormat: (row.contentFormat || 'markdown') as 'markdown' | 'rich',
    language: row.language,
    category: row.category,
    tags: row.tags ? row.tags.split(',') : [],
    favorite: row.favorite === 1,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    folderId: row.folderId || undefined,
    template: row.template || undefined,
    relatedNotes: row.relatedNotes ? row.relatedNotes.split(',') : [],
    summary: row.summary || undefined
  };
}

export async function createNote(input: NoteInput): Promise<Note> {
  const db = initDb();
  
  const id = Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
  const now = new Date().toISOString();
  
  db.transaction(() => {
    db.prepare(`
      INSERT INTO notes (
        id, title, content, content_format, language, category, favorite, 
        created_at, updated_at, folder_id, template, summary
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      input.title,
      input.content,
      input.contentFormat || 'markdown',
      input.language,
      input.category,
      input.favorite ? 1 : 0,
      now,
      now,
      input.folderId || null,
      input.template || null,
      input.summary || null
    );
    
    for (const tag of input.tags || []) {
      db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)').run(tag);
      const tagResult = db.prepare('SELECT id FROM tags WHERE name = ?').get(tag) as { id: number } | undefined;
      if (tagResult) {
        db.prepare('INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)').run(id, tagResult.id);
      }
    }
    
    for (const relatedNoteId of input.relatedNotes || []) {
      db.prepare('INSERT INTO related_notes (note_id, related_note_id) VALUES (?, ?)').run(id, relatedNoteId);
    }
  })();
  
  return getNoteById(id) as Promise<Note>;
}

export async function updateNote(id: string, input: Partial<NoteInput>): Promise<Note | null> {
  const db = initDb();
  const existing = await getNoteById(id);
  
  if (!existing) return null;
  
  const now = new Date().toISOString();
  
  db.transaction(() => {
    db.prepare(`
      UPDATE notes SET
        title = ?,
        content = ?,
        content_format = ?,
        language = ?,
        category = ?,
        favorite = ?,
        updated_at = ?,
        folder_id = ?,
        template = ?,
        summary = ?
      WHERE id = ?
    `).run(
      input.title ?? existing.title,
      input.content ?? existing.content,
      input.contentFormat ?? existing.contentFormat ?? 'markdown',
      input.language ?? existing.language,
      input.category ?? existing.category,
      input.favorite !== undefined ? (input.favorite ? 1 : 0) : (existing.favorite ? 1 : 0),
      now,
      input.folderId !== undefined ? input.folderId : existing.folderId,
      input.template !== undefined ? input.template : existing.template,
      input.summary !== undefined ? input.summary : existing.summary,
      id
    );
    
    if (input.tags !== undefined) {
      db.prepare('DELETE FROM note_tags WHERE note_id = ?').run(id);
      
      for (const tag of input.tags) {
        db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)').run(tag);
        const tagResult = db.prepare('SELECT id FROM tags WHERE name = ?').get(tag) as { id: number } | undefined;
        if (tagResult) {
          db.prepare('INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)').run(id, tagResult.id);
        }
      }
    }
    
    if (input.relatedNotes !== undefined) {
      db.prepare('DELETE FROM related_notes WHERE note_id = ?').run(id);
      
      for (const relatedNoteId of input.relatedNotes) {
        db.prepare('INSERT INTO related_notes (note_id, related_note_id) VALUES (?, ?)').run(id, relatedNoteId);
      }
    }
  })();
  
  return getNoteById(id);
}

export async function deleteNote(id: string): Promise<boolean> {
  const db = initDb();
  const result = db.prepare('DELETE FROM notes WHERE id = ?').run(id);
  
  return result.changes > 0;
}

export async function toggleFavorite(id: string): Promise<Note | null> {
  const db = initDb();
  
  try {
    // Use a transaction to ensure atomicity
    db.transaction(() => {
      const existing = db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as NoteRow | undefined;
      
      if (!existing) return null;
      
      const newFavoriteValue = existing.favorite ? 0 : 1;
      db.prepare('UPDATE notes SET favorite = ?, updated_at = ? WHERE id = ?')
        .run(newFavoriteValue, new Date().toISOString(), id);
    })();
    
    // Get the updated note after the transaction completes
    return getNoteById(id);
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
}

export async function getCategories(): Promise<Array<{ id: number; name: string; color: string; icon: string; position: number }>> {
  const db = initDb();
  const categories = db.prepare(`
    SELECT id, name, color, icon, position
    FROM categories
    ORDER BY position ASC, name ASC
  `).all() as Array<{ id: number; name: string; color: string; icon: string; position: number }>;
  
  return categories;
}

export async function getTags(): Promise<string[]> {
  const db = initDb();
  const rows = db.prepare('SELECT DISTINCT name FROM tags ORDER BY name').all() as Array<{ name: string }>;
  return rows.map(row => row.name);
}

export async function getTemplates(): Promise<NoteTemplate[]> {
  return templates;
}

export function importNotes(markdown: string): NoteInput[] {
  const notes: NoteInput[] = [];
  const sections = markdown.split(/^## /m).filter(Boolean);
  
  for (const section of sections) {
    const lines = section.trim().split('\n');
    const title = lines[0].trim();
    
    const metaMatch = section.match(/\*\*Category:\*\* (\w+)\s*\n\*\*Tags:\*\* ([^\n]+)/);
    const language = 'markdown';
    const category = metaMatch?.[1] || 'Other';
    const tags = metaMatch?.[2]?.split(',').map(t => t.trim()) || [];
    
    // Extract content after metadata
    const contentStart = section.indexOf('\n\n', section.indexOf('**Tags:**')) + 2;
    const content = contentStart > 1 ? section.substring(contentStart).trim() : '';
    
    notes.push({
      title,
      content,
      language,
      category,
      tags,
      favorite: false
    });
  }
  
  return notes;
}

export function exportNotesToMarkdown(notes: Note[]): string {
  return notes.map(note => {
    const tags = note.tags.join(', ');
    return `## ${note.title}

**Category:** ${note.category}
**Tags:** ${tags}

${note.content}
`;
  }).join('\n---\n\n');
}