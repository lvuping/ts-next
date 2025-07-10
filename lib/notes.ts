import type { Note, NoteInput, NotesData, NoteTemplate } from '@/types/note';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'lib/data/notes.json');
const LOCK_FILE = path.join(process.cwd(), 'lib/data/.notes.lock');
const LOCK_TIMEOUT = 5000; // 5 seconds

// Simple file-based lock mechanism
async function acquireLock(): Promise<void> {
  const startTime = Date.now();
  while (true) {
    try {
      // Try to create lock file exclusively
      await fs.writeFile(LOCK_FILE, process.pid.toString(), { flag: 'wx' });
      return;
    } catch {
      // Lock file exists, check if it's stale
      if (Date.now() - startTime > LOCK_TIMEOUT) {
        // Force remove stale lock
        try {
          await fs.unlink(LOCK_FILE);
        } catch {}
        throw new Error('Lock acquisition timeout');
      }
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
}

async function releaseLock(): Promise<void> {
  try {
    await fs.unlink(LOCK_FILE);
  } catch {}
}

// Initialize data file if it doesn't exist
async function initializeDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    const initialData: NotesData = {
      notes: [],
      categories: ['Frontend', 'Backend', 'Database', 'DevOps', 'Security', 'Other'],
      tags: [],
      folders: [],
      templates: [
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
      ]
    };
    
    // Create directory if it doesn't exist
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await saveNotesData(initialData);
  }
}

// Read notes data
async function getNotesData(): Promise<NotesData> {
  await initializeDataFile();
  const data = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(data);
}

// Save notes data
async function saveNotesData(data: NotesData): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// Get all notes with optional filtering
export async function getAllNotes(params?: {
  search?: string;
  category?: string;
  tag?: string;
  favorite?: boolean;
}): Promise<Note[]> {
  const data = await getNotesData();
  let notes = data.notes;
  
  if (params?.search) {
    const searchLower = params.search.toLowerCase();
    notes = notes.filter(note => 
      note.title.toLowerCase().includes(searchLower) ||
      note.content.toLowerCase().includes(searchLower) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }
  
  if (params?.category) {
    notes = notes.filter(note => note.category === params.category);
  }
  
  if (params?.tag) {
    notes = notes.filter(note => note.tags.includes(params.tag!));
  }
  
  if (params?.favorite !== undefined) {
    notes = notes.filter(note => note.favorite === params.favorite);
  }
  
  // Sort by updatedAt descending
  return notes.sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

// Get single note
export async function getNoteById(id: string): Promise<Note | null> {
  const data = await getNotesData();
  return data.notes.find(note => note.id === id) || null;
}

// Create note
export async function createNote(input: NoteInput): Promise<Note> {
  await acquireLock();
  try {
    const data = await getNotesData();
    
    const newNote: Note = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    data.notes.push(newNote);
    
    // Update tags list
    input.tags.forEach(tag => {
      if (!data.tags.includes(tag)) {
        data.tags.push(tag);
      }
    });
    
    await saveNotesData(data);
    return newNote;
  } finally {
    await releaseLock();
  }
}

// Update note
export async function updateNote(id: string, input: NoteInput): Promise<Note | null> {
  await acquireLock();
  try {
    const data = await getNotesData();
    const index = data.notes.findIndex(note => note.id === id);
    
    if (index === -1) return null;
    
    const updatedNote: Note = {
      ...data.notes[index],
      ...input,
      updatedAt: new Date().toISOString()
    };
    
    data.notes[index] = updatedNote;
    
    // Update tags list
    input.tags.forEach(tag => {
      if (!data.tags.includes(tag)) {
        data.tags.push(tag);
      }
    });
    
    await saveNotesData(data);
    return updatedNote;
  } finally {
    await releaseLock();
  }
}

// Delete note
export async function deleteNote(id: string): Promise<boolean> {
  await acquireLock();
  try {
    const data = await getNotesData();
    const index = data.notes.findIndex(note => note.id === id);
    
    if (index === -1) return false;
    
    data.notes.splice(index, 1);
    await saveNotesData(data);
    return true;
  } finally {
    await releaseLock();
  }
}

// Get all categories
export async function getAllCategories(): Promise<string[]> {
  const data = await getNotesData();
  return data.categories;
}

// Get all tags
export async function getAllTags(): Promise<string[]> {
  const data = await getNotesData();
  return data.tags.sort();
}

// Toggle favorite status
export async function toggleFavorite(id: string): Promise<Note | null> {
  await acquireLock();
  try {
    const data = await getNotesData();
    const index = data.notes.findIndex(note => note.id === id);
    
    if (index === -1) return null;
    
    data.notes[index].favorite = !data.notes[index].favorite;
    data.notes[index].updatedAt = new Date().toISOString();
    
    await saveNotesData(data);
    return data.notes[index];
  } finally {
    await releaseLock();
  }
}

// Get all templates
export async function getAllTemplates(): Promise<NoteTemplate[]> {
  const data = await getNotesData();
  return data.templates || [];
}

// Import notes from markdown
export async function importNotes(markdownContent: string): Promise<{ imported: number; errors: string[] }> {
  await acquireLock();
  try {
    const data = await getNotesData();
    const errors: string[] = [];
    let imported = 0;
    
    // Parse markdown format
    const noteBlocks = markdownContent.split(/^## /m).filter(Boolean);
    
    for (const block of noteBlocks) {
      try {
        const lines = block.trim().split('\n');
        const title = lines[0].trim();
        
        // Extract metadata
        const metadataMatch = block.match(/\*\*Language:\*\* (.+)\n\*\*Category:\*\* (.+)\n\*\*Tags:\*\* (.+)\n\*\*Created:\*\* (.+)\n\*\*Updated:\*\* (.+)/);
        
        if (!metadataMatch) {
          errors.push(`Failed to parse metadata for note: ${title}`);
          continue;
        }
        
        const [, language, category, tagsStr, createdAt, updatedAt] = metadataMatch;
        const tags = tagsStr.split(', ').map(t => t.trim());
        
        // Extract content
        const contentMatch = block.match(/```[\w]*\n([\s\S]*?)```/);
        const content = contentMatch ? contentMatch[1].trim() : '';
        
        const newNote: Note = {
          id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
          title,
          content,
          language,
          category,
          tags,
          favorite: false,
          createdAt,
          updatedAt
        };
        
        data.notes.push(newNote);
        
        // Update tags list
        tags.forEach(tag => {
          if (!data.tags.includes(tag)) {
            data.tags.push(tag);
          }
        });
        
        imported++;
      } catch (error) {
        errors.push(`Failed to import note: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    await saveNotesData(data);
    return { imported, errors };
  } finally {
    await releaseLock();
  }
}

// Export notes to markdown
export async function exportNotesToMarkdown(noteIds?: string[]): Promise<string> {
  const data = await getNotesData();
  const notes = noteIds 
    ? data.notes.filter(note => noteIds.includes(note.id))
    : data.notes;
  
  return notes.map(note => {
    return `## ${note.title}

**Language:** ${note.language}
**Category:** ${note.category}
**Tags:** ${note.tags.join(', ')}
**Created:** ${note.createdAt}
**Updated:** ${note.updatedAt}

\`\`\`${note.language}
${note.content}
\`\`\`

---
`;
  }).join('\n');
}