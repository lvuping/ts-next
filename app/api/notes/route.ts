import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getAllNotes, createNote, importNotes, exportNotesToMarkdown } from '@/lib/notes';
import type { NoteInput } from '@/types/note';

export async function GET(request: NextRequest) {
  try {
    if (!await isAuthenticated()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const tag = searchParams.get('tag') || undefined;
    const favorite = searchParams.get('favorite') === 'true' ? true : undefined;

    const notes = await getAllNotes({ search, category, tag, favorite });
    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!await isAuthenticated()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';
    
    // Handle import
    if (contentType.includes('text/markdown')) {
      const markdownContent = await request.text();
      const result = await importNotes(markdownContent);
      return NextResponse.json(result);
    }

    // Handle normal note creation
    const body: NoteInput = await request.json();
    
    // Validate required fields
    if (!body.title || !body.content || !body.language || !body.category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const note = await createNote(body);
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}

// Export notes endpoint
export async function PUT(request: NextRequest) {
  try {
    if (!await isAuthenticated()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { noteIds } = await request.json();
    const markdown = await exportNotesToMarkdown(noteIds);
    
    return new NextResponse(markdown, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': 'attachment; filename="notes-export.md"',
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