import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const category = db.prepare(`
      SELECT id, name, color, icon, position, created_at, updated_at
      FROM categories
      WHERE id = ?
    `).get(id);

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, color, icon, position } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const db = getDb();
    
    const existing = db.prepare('SELECT id FROM categories WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const updateFields = [];
    const updateValues = [];

    updateFields.push('name = ?');
    updateValues.push(name.trim());

    if (color !== undefined) {
      updateFields.push('color = ?');
      updateValues.push(color);
    }

    if (icon !== undefined) {
      updateFields.push('icon = ?');
      updateValues.push(icon);
    }

    if (position !== undefined) {
      updateFields.push('position = ?');
      updateValues.push(position);
    }

    updateFields.push('updated_at = datetime("now")');
    updateValues.push(id);

    db.prepare(`
      UPDATE categories 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `).run(...updateValues);

    const updatedCategory = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    if (error instanceof Error && error.message?.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    
    const existing = db.prepare('SELECT id FROM categories WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const notesCount = db.prepare('SELECT COUNT(*) as count FROM notes WHERE category_id = ?').get(id) as { count: number };
    
    if (notesCount.count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with existing notes. Please reassign the notes first.' },
        { status: 409 }
      );
    }

    db.prepare('DELETE FROM categories WHERE id = ?').run(id);

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}