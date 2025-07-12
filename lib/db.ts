import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'notes.db');

// Singleton database instance
let dbInstance: Database.Database | null = null;

// Database configuration
const DB_CONFIG = {
  // Enable verbose mode in development
  verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
  // Set timeout for long-running queries
  timeout: 5000,
  // Enable file stats for better performance tracking
  fileMustExist: false,
};

export function getDb() {
  // Return existing instance if available
  if (dbInstance && dbInstance.open) {
    return dbInstance;
  }
  
  // Create new database instance with configuration
  const db = new Database(DB_PATH, DB_CONFIG);
  
  // Configure database pragmas for optimal performance
  db.pragma('journal_mode = WAL'); // Write-Ahead Logging for better concurrency
  db.pragma('foreign_keys = ON'); // Enable foreign key constraints
  db.pragma('synchronous = NORMAL'); // Balance between safety and performance
  db.pragma('cache_size = -64000'); // 64MB cache size
  db.pragma('temp_store = MEMORY'); // Use memory for temporary tables
  db.pragma('mmap_size = 268435456'); // 256MB memory-mapped I/O
  
  // Set up connection lifecycle hooks
  process.on('exit', () => closeDb());
  process.on('SIGINT', () => {
    closeDb();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    closeDb();
    process.exit(0);
  });
  
  createTables(db);
  migrateSchema(db);
  migrateCategories(db);
  
  // Store the instance
  dbInstance = db;
  
  return db;
}

export function closeDb() {
  if (dbInstance && dbInstance.open) {
    console.log('Closing database connection...');
    dbInstance.close();
    dbInstance = null;
  }
}

// Execute a query with automatic retry on busy
export function executeWithRetry<T>(
  fn: () => T,
  maxRetries: number = 3,
  delay: number = 100
): T {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return fn();
    } catch (error: unknown) {
      lastError = error as Error;
      
      // Only retry on SQLITE_BUSY errors
      const errorWithCode = error as { code?: string };
      if (errorWithCode.code !== 'SQLITE_BUSY' || i === maxRetries - 1) {
        throw error;
      }
      
      // Wait before retrying
      const waitTime = delay * Math.pow(2, i); // Exponential backoff
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, waitTime);
    }
  }
  
  throw lastError!;
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
      summary TEXT,
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
    CREATE INDEX IF NOT EXISTS idx_related_notes_note_id ON related_notes(note_id);
    CREATE INDEX IF NOT EXISTS idx_related_notes_related_note_id ON related_notes(related_note_id);
  `);
  
  // Create materialized view tables
  createMaterializedViews(db);
}

function createMaterializedViews(db: Database.Database) {
  // Create summary table for note statistics
  db.exec(`
    CREATE TABLE IF NOT EXISTS note_stats (
      category TEXT PRIMARY KEY,
      note_count INTEGER DEFAULT 0,
      favorite_count INTEGER DEFAULT 0,
      last_updated TEXT DEFAULT (datetime('now'))
    )
  `);
  
  // Create view for tag statistics
  db.exec(`
    CREATE VIEW IF NOT EXISTS tag_stats AS
    SELECT 
      t.name as tag_name,
      COUNT(DISTINCT nt.note_id) as note_count,
      MAX(n.updated_at) as last_used
    FROM tags t
    LEFT JOIN note_tags nt ON t.id = nt.tag_id
    LEFT JOIN notes n ON nt.note_id = n.id
    GROUP BY t.id, t.name
  `);
  
  // Create view for notes with pre-joined tags
  db.exec(`
    CREATE VIEW IF NOT EXISTS notes_with_tags AS
    SELECT 
      n.*,
      GROUP_CONCAT(t.name, ',') as tag_list
    FROM notes n
    LEFT JOIN note_tags nt ON n.id = nt.note_id
    LEFT JOIN tags t ON nt.tag_id = t.id
    GROUP BY n.id
  `);
  
  // Create triggers to maintain note_stats table
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_note_stats_on_insert
    AFTER INSERT ON notes
    BEGIN
      INSERT OR REPLACE INTO note_stats (category, note_count, favorite_count, last_updated)
      SELECT 
        NEW.category,
        COALESCE((SELECT note_count FROM note_stats WHERE category = NEW.category), 0) + 1,
        COALESCE((SELECT favorite_count FROM note_stats WHERE category = NEW.category), 0) + 
          CASE WHEN NEW.favorite = 1 THEN 1 ELSE 0 END,
        datetime('now');
    END;
    
    CREATE TRIGGER IF NOT EXISTS update_note_stats_on_update
    AFTER UPDATE ON notes
    WHEN OLD.category != NEW.category OR OLD.favorite != NEW.favorite
    BEGIN
      -- Update old category stats
      UPDATE note_stats 
      SET 
        note_count = CASE WHEN OLD.category = NEW.category THEN note_count ELSE note_count - 1 END,
        favorite_count = favorite_count - CASE WHEN OLD.favorite = 1 THEN 1 ELSE 0 END,
        last_updated = datetime('now')
      WHERE category = OLD.category;
      
      -- Update new category stats if category changed
      INSERT OR REPLACE INTO note_stats (category, note_count, favorite_count, last_updated)
      SELECT 
        NEW.category,
        COALESCE((SELECT note_count FROM note_stats WHERE category = NEW.category), 0) + 
          CASE WHEN OLD.category != NEW.category THEN 1 ELSE 0 END,
        COALESCE((SELECT favorite_count FROM note_stats WHERE category = NEW.category), 0) + 
          CASE WHEN NEW.favorite = 1 THEN 1 ELSE 0 END,
        datetime('now')
      WHERE OLD.category != NEW.category OR NEW.favorite != OLD.favorite;
    END;
    
    CREATE TRIGGER IF NOT EXISTS update_note_stats_on_delete
    AFTER DELETE ON notes
    BEGIN
      UPDATE note_stats 
      SET 
        note_count = note_count - 1,
        favorite_count = favorite_count - CASE WHEN OLD.favorite = 1 THEN 1 ELSE 0 END,
        last_updated = datetime('now')
      WHERE category = OLD.category;
    END;
  `);
  
  // Populate initial stats if empty
  const statsCount = db.prepare('SELECT COUNT(*) as count FROM note_stats').get() as { count: number };
  if (statsCount.count === 0) {
    db.exec(`
      INSERT INTO note_stats (category, note_count, favorite_count)
      SELECT 
        category,
        COUNT(*) as note_count,
        SUM(CASE WHEN favorite = 1 THEN 1 ELSE 0 END) as favorite_count
      FROM notes
      GROUP BY category
    `);
  }
}

function migrateSchema(db: Database.Database) {
  // Check if category_id column exists
  const columns = db.prepare("PRAGMA table_info(notes)").all() as Array<{ name: string }>;
  const hasCategoryId = columns.some(col => col.name === 'category_id');
  const hasSummary = columns.some(col => col.name === 'summary');
  const hasContentFormat = columns.some(col => col.name === 'content_format');
  
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
  
  if (!hasSummary) {
    console.log('Adding summary column to notes table...');
    try {
      db.exec('ALTER TABLE notes ADD COLUMN summary TEXT');
      console.log('Successfully added summary column');
    } catch (error) {
      // If the column already exists or there's another error, log it but continue
      console.log('Note: Could not add summary column:', error);
    }
  }
  
  if (!hasContentFormat) {
    console.log('Adding content_format column to notes table...');
    try {
      db.exec('ALTER TABLE notes ADD COLUMN content_format TEXT DEFAULT "markdown"');
      console.log('Successfully added content_format column');
    } catch (error) {
      // If the column already exists or there's another error, log it but continue
      console.log('Note: Could not add content_format column:', error);
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