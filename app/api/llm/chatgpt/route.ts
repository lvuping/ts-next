import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { isAuthenticated } from '@/lib/auth';
import { env } from '@/lib/env';
import { openaiCache, generateChatGPTCacheKey } from '@/lib/llm-cache';
import { openaiRateLimiter } from '@/lib/llm-rate-limiter';
import { createCachedResponse, CacheControl } from '@/lib/cache-headers';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    if (!await isAuthenticated()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'ChatGPT service not configured' },
        { status: 503 }
      );
    }

    const { model, messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = generateChatGPTCacheKey(model || 'gpt-4', messages);
    const cachedResponse = openaiCache.get(cacheKey);
    
    if (cachedResponse) {
      console.log(`[OpenAI] Cache hit for key: ${cacheKey.substring(0, 8)}...`);
      return createCachedResponse(
        cachedResponse,
        CacheControl.API_DETAIL,
        {
          headers: {
            'X-Cache': 'HIT',
            'X-Response-Time': `${Date.now() - startTime}ms`
          }
        }
      );
    }

    // Execute with rate limiting
    const result = await openaiRateLimiter.execute(async () => {
      // Set timeout for the API call
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      try {
        const client = new OpenAI({
          apiKey: env.OPENAI_API_KEY,
          timeout: 30000, // 30 second timeout
          maxRetries: 2,
        });

        const completion = await client.chat.completions.create({
          model: model || 'gpt-4-turbo-preview',
          messages: messages,
        }, {
          signal: controller.signal,
        });

        const content = completion.choices[0]?.message?.content || '';

        return { content };
      } finally {
        clearTimeout(timeoutId);
      }
    });

    // Cache the successful response
    openaiCache.set(cacheKey, result, 3600000); // Cache for 1 hour
    
    return createCachedResponse(
      result,
      CacheControl.API_DETAIL,
      {
        headers: {
          'X-Cache': 'MISS',
          'X-Response-Time': `${Date.now() - startTime}ms`,
          'X-Rate-Limit-Stats': JSON.stringify(openaiRateLimiter.getStats())
        }
      }
    );
  } catch (error) {
    console.error('ChatGPT assist error:', error);
    const err = error as Error & { status?: number; name?: string; code?: string };
    
    // Return more specific error messages
    if (err.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout - please try again' },
        { status: 504 }
      );
    }
    
    if (err.status === 429) {
      return NextResponse.json(
        { error: 'Too many requests - please try again later' },
        { status: 429 }
      );
    }
    
    if (err.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'OpenAI quota exceeded - please check your billing' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process request', details: err.message },
      { status: 500 }
    );
  }
}