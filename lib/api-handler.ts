import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from './auth';

export type APIHandler<T = unknown> = (req: NextRequest) => Promise<T>;

interface APIError {
  error: string;
  details?: unknown;
}

export function createAuthenticatedHandler<T>(
  handler: APIHandler<T>,
  requireAuth = true
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Check authentication if required
      if (requireAuth && !(await isAuthenticated())) {
        return NextResponse.json(
          { error: 'Unauthorized' } satisfies APIError,
          { status: 401 }
        );
      }

      // Execute the handler
      const result = await handler(req);
      
      // Return success response
      return NextResponse.json(result);
    } catch (error) {
      // Log error for debugging
      console.error('API Handler Error:', error);

      // Return error response
      if (error instanceof Error) {
        return NextResponse.json(
          { 
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
          } satisfies APIError,
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: 'Internal Server Error' } satisfies APIError,
        { status: 500 }
      );
    }
  };
}

// Utility for parsing request body with validation
export async function parseRequestBody<T>(
  req: NextRequest,
  validator?: (data: unknown) => data is T
): Promise<T> {
  try {
    const data = await req.json();
    
    if (validator && !validator(data)) {
      throw new Error('Invalid request body');
    }
    
    return data as T;
  } catch {
    throw new Error('Failed to parse request body');
  }
}

// Common response helpers
export const APIResponse = {
  success: <T>(data: T, status = 200) => 
    NextResponse.json(data, { status }),
    
  error: (message: string, status = 500) => 
    NextResponse.json({ error: message } satisfies APIError, { status }),
    
  notFound: (message = 'Resource not found') => 
    NextResponse.json({ error: message } satisfies APIError, { status: 404 }),
    
  badRequest: (message = 'Bad request') => 
    NextResponse.json({ error: message } satisfies APIError, { status: 400 }),
};