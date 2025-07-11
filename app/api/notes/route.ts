import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedHandler, parseRequestBody } from '@/lib/api-handler';
import { getAllNotes, createNote, importNotes, exportNotesToMarkdown } from '@/lib/notes';
import { CacheControl } from '@/lib/cache-headers';
import { revalidateNoteData } from '@/lib/revalidation-config';
import type { NoteInput } from '@/types/note';

export const GET = createAuthenticatedHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const filters = {
    search: searchParams.get('search') || undefined,
    category: searchParams.get('category') || undefined,
    tag: searchParams.get('tag') || undefined,
    favorite: searchParams.get('favorite') === 'true' ? true : undefined,
    sortBy: (searchParams.get('sortBy') as 'createdAt' | 'updatedAt' | 'title') || undefined,
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined,
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
    offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
  };

  const result = await getAllNotes(filters);
  return result;
}, {
  cacheControl: CacheControl.API_LIST,
  enableETag: true
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
  if (!body.title || !body.content || !body.category) {
    throw new Error('Missing required fields');
  }
  
  // Default language to markdown
  body.language = body.language || 'markdown';

  const note = await createNote(body);
  
  // Revalidate cached data
  await revalidateNoteData(note.id);
  
  return note;
});

// Export notes endpoint - handle manually due to special response type
export async function PUT(request: NextRequest) {
  try {
    const handler = createAuthenticatedHandler(async (req: NextRequest) => {
      const { noteIds } = await parseRequestBody<{ noteIds: string[] }>(req);
      
      // Fetch the notes based on IDs
      const result = await getAllNotes({});
      const notesToExport = noteIds.length > 0 
        ? result.notes.filter(note => noteIds.includes(note.id))
        : result.notes;
      
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