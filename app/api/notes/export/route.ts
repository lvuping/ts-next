import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getAllNotes, exportNotesToMarkdown } from '@/lib/notes';

export async function GET(request: NextRequest) {
  try {
    if (!await isAuthenticated()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const ids = searchParams.get('ids')?.split(',').filter(Boolean);
    
    // Get notes - either specific IDs or all notes
    const allNotes = await getAllNotes();
    const notes = ids 
      ? allNotes.filter(note => ids.includes(note.id))
      : allNotes;
    
    if (notes.length === 0) {
      return NextResponse.json(
        { error: 'No notes found to export' },
        { status: 404 }
      );
    }
    
    // Convert notes to markdown
    const markdown = exportNotesToMarkdown(notes);
    
    // Return as downloadable file
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = ids 
      ? `notes-export-selected-${timestamp}.md`
      : `notes-export-all-${timestamp}.md`;
    
    return new NextResponse(markdown, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting notes:', error);
    return NextResponse.json(
      { error: 'Failed to export notes' },
      { status: 500 }
    );
  }
}