import { NextRequest } from 'next/server';
import { createAuthenticatedHandler, parseRequestBody } from '@/lib/api-handler';
import { CacheControl } from '@/lib/cache-headers';
import { getNoteById, updateNote, deleteNote } from '@/lib/notes';
import { revalidateNoteData } from '@/lib/revalidation-config';
import type { NoteInput } from '@/types/note';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const handler = createAuthenticatedHandler(async () => {
    const { id } = await params;
    const note = await getNoteById(id);
    
    if (!note) {
      throw new Error('Note not found');
    }
    
    return note;
  }, {
    cacheControl: CacheControl.API_DETAIL,
    enableETag: true
  });
  
  return handler(request);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const handler = createAuthenticatedHandler(async (req) => {
    const { id } = await params;
    const body = await parseRequestBody<NoteInput>(req);
    
    // Validate required fields
    if (!body.title || !body.content || !body.category) {
      throw new Error('Missing required fields');
    }
    
    // Default language to markdown
    body.language = body.language || 'markdown';

    const note = await updateNote(id, body);
    
    if (!note) {
      throw new Error('Note not found');
    }
    
    // Revalidate cached data
    await revalidateNoteData(id);
    
    return note;
  });
  
  return handler(request);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const handler = createAuthenticatedHandler(async () => {
    const { id } = await params;
    const success = await deleteNote(id);
    
    if (!success) {
      throw new Error('Note not found');
    }
    
    // Revalidate cached data
    await revalidateNoteData(id);
    
    return { success: true };
  });
  
  return handler(request);
}