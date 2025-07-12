import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const CacheControl = {
  PRIVATE_NO_CACHE: 'no-cache, no-store, must-revalidate',
  PUBLIC_IMMUTABLE: 'public, max-age=31536000, immutable',
  PUBLIC_STATIC: 'public, max-age=3600, stale-while-revalidate=86400',
  API_DEFAULT: 'private, max-age=0, stale-while-revalidate=60',
  API_LIST: 'private, max-age=0, stale-while-revalidate=300',
  API_DETAIL: 'private, max-age=60, stale-while-revalidate=600',
} as const;

export function generateETag(data: unknown): string {
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  // Simple hash function for Edge Runtime compatibility
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

export function handleConditionalRequest(
  request: NextRequest,
  etag: string,
  lastModified?: Date
): NextResponse | null {
  const ifNoneMatch = request.headers.get('if-none-match');
  const ifModifiedSince = request.headers.get('if-modified-since');

  if (ifNoneMatch && ifNoneMatch === etag) {
    return new NextResponse(null, { status: 304 });
  }

  if (ifModifiedSince && lastModified) {
    const ifModifiedSinceDate = new Date(ifModifiedSince);
    if (lastModified <= ifModifiedSinceDate) {
      return new NextResponse(null, { status: 304 });
    }
  }

  return null;
}

export function addCacheHeaders(
  response: NextResponse,
  cacheControl: string,
  etag?: string,
  lastModified?: Date
): NextResponse {
  response.headers.set('Cache-Control', cacheControl);
  
  if (etag) {
    response.headers.set('ETag', etag);
  }
  
  if (lastModified) {
    response.headers.set('Last-Modified', lastModified.toUTCString());
  }
  
  response.headers.set('Vary', 'Accept-Encoding');
  
  return response;
}

export function createCachedResponse(
  data: unknown,
  cacheControl: string = CacheControl.API_DEFAULT,
  options?: {
    status?: number;
    headers?: HeadersInit;
    lastModified?: Date;
  }
): NextResponse {
  const etag = generateETag(data);
  const response = NextResponse.json(data, {
    status: options?.status ?? 200,
    headers: options?.headers,
  });
  
  return addCacheHeaders(response, cacheControl, etag, options?.lastModified);
}