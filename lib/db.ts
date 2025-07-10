import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'notes.db');

export function getDb() {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  
  createTables(db);
  migrateSchema(db);
  migrateCategories(db);
  
  return db;
}

function createTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      color TEXT DEFAULT '#6B7280',
      icon TEXT DEFAULT 'folder',
      position INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      language TEXT NOT NULL,
      category TEXT NOT NULL,
      category_id INTEGER,
      favorite INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      folder_id TEXT,
      template TEXT,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )
  `);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    )
  `);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS note_tags (
      note_id TEXT NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (note_id, tag_id),
      FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS related_notes (
      note_id TEXT NOT NULL,
      related_note_id TEXT NOT NULL,
      PRIMARY KEY (note_id, related_note_id),
      FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
      FOREIGN KEY (related_note_id) REFERENCES notes(id) ON DELETE CASCADE
    )
  `);
  
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);
    CREATE INDEX IF NOT EXISTS idx_notes_category_id ON notes(category_id);
    CREATE INDEX IF NOT EXISTS idx_notes_favorite ON notes(favorite);
    CREATE INDEX IF NOT EXISTS idx_note_tags_note_id ON note_tags(note_id);
    CREATE INDEX IF NOT EXISTS idx_note_tags_tag_id ON note_tags(tag_id);
    CREATE INDEX IF NOT EXISTS idx_categories_position ON categories(position);
  `);
}

function migrateSchema(db: Database.Database) {
  // Check if category_id column exists
  const columns = db.prepare("PRAGMA table_info(notes)").all() as Array<{ name: string }>;
  const hasCategoryId = columns.some(col => col.name === 'category_id');
  
  if (!hasCategoryId) {
    console.log('Adding category_id column to notes table...');
    try {
      db.exec('ALTER TABLE notes ADD COLUMN category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL');
      console.log('Successfully added category_id column');
    } catch (error) {
      // If the column already exists or there's another error, log it but continue
      console.log('Note: Could not add category_id column:', error);
    }
  }
}

function migrateCategories(db: Database.Database) {
  const defaultCategories = [
    { name: 'Frontend', color: '#3B82F6', icon: 'code', position: 0 },
    { name: 'Backend', color: '#10B981', icon: 'server', position: 1 },
    { name: 'Database', color: '#F59E0B', icon: 'database', position: 2 },
    { name: 'DevOps', color: '#8B5CF6', icon: 'cloud', position: 3 },
    { name: 'Security', color: '#EF4444', icon: 'shield', position: 4 },
    { name: 'Other', color: '#6B7280', icon: 'folder', position: 5 }
  ];

  const checkCategory = db.prepare('SELECT id FROM categories WHERE name = ?');
  const insertCategory = db.prepare(`
    INSERT OR IGNORE INTO categories (name, color, icon, position, created_at, updated_at) 
    VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  const categoryMap = new Map<string, number>();
  
  for (const cat of defaultCategories) {
    insertCategory.run(cat.name, cat.color, cat.icon, cat.position);
    const result = checkCategory.get(cat.name) as { id: number } | undefined;
    if (result) {
      categoryMap.set(cat.name, result.id);
    }
  }

  const notesWithoutCategoryId = db.prepare('SELECT id, category FROM notes WHERE category_id IS NULL').all() as Array<{ id: string, category: string }>;
  const updateNote = db.prepare('UPDATE notes SET category_id = ? WHERE id = ?');
  
  for (const note of notesWithoutCategoryId) {
    const categoryId = categoryMap.get(note.category);
    if (categoryId) {
      updateNote.run(categoryId, note.id);
    }
  }
}

export function migrateFromJson(db: Database.Database) {
  const jsonPath = path.join(process.cwd(), 'lib', 'data', 'notes.json');
  
  if (!fs.existsSync(jsonPath)) {
    return;
  }
  
  try {
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    const { notes, tags } = jsonData;
    
    db.exec('BEGIN TRANSACTION');
    
    const insertTag = db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)');
    const tagMap = new Map<string, number>();
    
    for (const tagName of tags || []) {
      insertTag.run(tagName);
      const result = db.prepare('SELECT id FROM tags WHERE name = ?').get(tagName) as { id: number };
      tagMap.set(tagName, result.id);
    }
    
    const insertNote = db.prepare(`
      INSERT OR REPLACE INTO notes (
        id, title, content, language, category, favorite, 
        created_at, updated_at, folder_id, template
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const insertNoteTag = db.prepare('INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)');
    const insertRelatedNote = db.prepare('INSERT OR IGNORE INTO related_notes (note_id, related_note_id) VALUES (?, ?)');
    
    for (const note of notes || []) {
      insertNote.run(
        note.id,
        note.title,
        note.content,
        note.language,
        note.category,
        note.favorite ? 1 : 0,
        note.createdAt,
        note.updatedAt,
        note.folderId || null,
        note.template || null
      );
      
      for (const tag of note.tags || []) {
        const tagId = tagMap.get(tag);
        if (tagId) {
          insertNoteTag.run(note.id, tagId);
        }
      }
      
      for (const relatedNoteId of note.relatedNotes || []) {
        insertRelatedNote.run(note.id, relatedNoteId);
      }
    }
    
    db.exec('COMMIT');
    
    console.log('Migration completed successfully');
  } catch (error) {
    db.exec('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  }
}