import { NextRequest } from 'next/server';
import { createAuthenticatedHandler, parseRequestBody } from '@/lib/api-handler';
import { CacheControl } from '@/lib/cache-headers';
import { getDb } from '@/lib/db';

export const GET = createAuthenticatedHandler(async () => {
  const db = getDb();
  const categories = db.prepare(`
    SELECT id, name, color, icon, position, created_at, updated_at
    FROM categories
    ORDER BY position ASC, name ASC
  `).all();

  return categories;
}, {
  cacheControl: CacheControl.API_LIST,
  enableETag: true
});

export const POST = createAuthenticatedHandler(async (request: NextRequest) => {
  const { name, color, icon } = await parseRequestBody<{ name: string; color?: string; icon?: string }>(request);

  if (!name || !name.trim()) {
    throw new Error('Category name is required');
  }

  const db = getDb();
  
  const maxPosition = db.prepare('SELECT MAX(position) as max FROM categories').get() as { max: number | null };
  const position = (maxPosition.max || 0) + 1;

  try {
    const result = db.prepare(`
      INSERT INTO categories (name, color, icon, position, created_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(
      name.trim(),
      color || '#6B7280',
      icon || 'folder',
      position
    );

    const newCategory = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);

    return newCategory;
  } catch (error) {
    if (error instanceof Error && error.message?.includes('UNIQUE constraint failed')) {
      throw new Error('Category with this name already exists');
    }
    throw error;
  }
});