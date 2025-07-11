import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedHandler, parseRequestBody } from '@/lib/api-handler';
import { getAllNotes, createNote, importNotes, exportNotesToMarkdown } from '@/lib/notes';
import type { NoteInput } from '@/types/note';

export const GET = createAuthenticatedHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const filters = {
    search: searchParams.get('search') || undefined,
    category: searchParams.get('category') || undefined,
    tag: searchParams.get('tag') || undefined,
    favorite: searchParams.get('favorite') === 'true' ? true : undefined,
  };

  const notes = await getAllNotes(filters);
  return notes;
});

export const POST = createAuthenticatedHandler(async (request: NextRequest) => {
  const contentType = request.headers.get('content-type') || '';
  
  // Handle import
  if (contentType.includes('text/markdown')) {
    const markdownContent = await request.text();
    const result = await importNotes(markdownContent);
    return result;
  }

  // Handle normal note creation
  const body = await parseRequestBody<NoteInput>(request);
  
  // Validate required fields
  if (!body.title || !body.content || !body.language || !body.category) {
    throw new Error('Missing required fields');
  }

  const note = await createNote(body);
  return note;
});

// Export notes endpoint - handle manually due to special response type
export async function PUT(request: NextRequest) {
  try {
    const handler = createAuthenticatedHandler(async (req: NextRequest) => {
      const { noteIds } = await parseRequestBody<{ noteIds: string[] }>(req);
      
      // Fetch the notes based on IDs
      const allNotes = await getAllNotes({});
      const notesToExport = noteIds.length > 0 
        ? allNotes.filter(note => noteIds.includes(note.id))
        : allNotes;
      
      const markdown = exportNotesToMarkdown(notesToExport);
      return markdown;
    });

    // Call the handler to get authentication and error handling
    const authResponse = await handler(request);
    
    // Check if it's an error response
    if (authResponse.status !== 200) {
      return authResponse;
    }

    // Extract the markdown content
    const markdown = await authResponse.json();
    
    // Return as markdown file
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