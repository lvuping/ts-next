import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { importNotes } from '@/lib/notes';

export async function POST(request: NextRequest) {
  try {
    if (!await isAuthenticated()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const content = await file.text();
    const notesToImport = importNotes(content);
    
    // Import each note
    let importedCount = 0;
    const errors: string[] = [];
    
    for (const noteData of notesToImport) {
      try {
        const { createNote } = await import('@/lib/notes');
        await createNote(noteData);
        importedCount++;
      } catch (error) {
        console.error('Error importing note:', noteData.title, error);
        errors.push(`Failed to import: ${noteData.title}`);
      }
    }
    
    return NextResponse.json({ 
      count: importedCount,
      total: notesToImport.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error importing notes:', error);
    return NextResponse.json(
      { error: 'Failed to import notes' },
      { status: 500 }
    );
  }
}