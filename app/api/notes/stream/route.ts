import { NextRequest } from 'next/server';
import { createAuthenticatedHandler } from '@/lib/api-handler';
import { getAllNotesStream } from '@/lib/notes-stream';

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

  // Create a TransformStream for streaming JSON
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Start streaming response
  getAllNotesStream(filters, async (chunk) => {
    await writer.write(encoder.encode(chunk));
  }).then(async () => {
    await writer.close();
  }).catch(async (error) => {
    console.error('Streaming error:', error);
    await writer.abort(error);
  });

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache',
      'Transfer-Encoding': 'chunked',
    },
  });
});