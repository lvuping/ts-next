import { getDb } from '@/lib/db';

export interface NoteIdParam {
  id: string;
}

// Get recent note IDs for static generation
export async function getRecentNoteIds(limit: number = 10): Promise<NoteIdParam[]> {
  const db = getDb();
  try {
    const notes = await db.prepare(
      `SELECT id FROM notes 
       ORDER BY updated_at DESC 
       LIMIT ?`
    ).all(limit) as { id: string }[];

    return notes.map(note => ({ id: note.id }));
  } catch (error) {
    console.error('Failed to get recent note IDs:', error);
    return [];
  }
}

// Get frequently accessed note IDs (based on a hypothetical view count)
// In a real app, you might track view counts
export async function getPopularNoteIds(limit: number = 10): Promise<NoteIdParam[]> {
  const db = getDb();
  try {
    // For now, we'll get the most recently updated notes as a proxy for popular notes
    // In production, you'd track view counts and use those
    const notes = await db.prepare(
      `SELECT id FROM notes 
       WHERE favorite = 1
       ORDER BY updated_at DESC 
       LIMIT ?`
    ).all(limit) as { id: string }[];

    return notes.map(note => ({ id: note.id }));
  } catch (error) {
    console.error('Failed to get popular note IDs:', error);
    return [];
  }
}