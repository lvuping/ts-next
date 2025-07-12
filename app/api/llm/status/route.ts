import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { geminiCache, openaiCache } from '@/lib/llm-cache';
import { geminiRateLimiter, openaiRateLimiter } from '@/lib/llm-rate-limiter';
import { getAvailableProviders } from '@/lib/llm-fallback';
import { env } from '@/lib/env';

export async function GET() {
  try {
    if (!await isAuthenticated()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Collect status information
    const status = {
      providers: {
        gemini: {
          configured: !!env.GEMINI_API_KEY,
          cache: geminiCache.getStats(),
          rateLimiter: geminiRateLimiter.getStats()
        },
        openai: {
          configured: !!env.OPENAI_API_KEY,
          cache: openaiCache.getStats(),
          rateLimiter: openaiRateLimiter.getStats()
        }
      },
      availableProviders: getAvailableProviders().map(p => ({
        name: p.name,
        priority: p.priority,
        available: p.available
      })),
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(status, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    console.error('LLM status error:', error);
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}