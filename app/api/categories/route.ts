import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const categories = db.prepare(`
      SELECT id, name, color, icon, position, created_at, updated_at
      FROM categories
      ORDER BY position ASC, name ASC
    `).all();

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, color, icon } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const db = getDb();
    
    const maxPosition = db.prepare('SELECT MAX(position) as max FROM categories').get() as { max: number | null };
    const position = (maxPosition.max || 0) + 1;

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

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    if (error instanceof Error && error.message?.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}