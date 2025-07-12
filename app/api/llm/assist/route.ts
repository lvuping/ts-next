import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { isAuthenticated } from '@/lib/auth';
import { env } from '@/lib/env';
import { geminiCache, generateAssistCacheKey } from '@/lib/llm-cache';
import { geminiRateLimiter } from '@/lib/llm-rate-limiter';
import { createCachedResponse, CacheControl } from '@/lib/cache-headers';
import { fallbackProvider, getErrorRecoverySuggestions } from '@/lib/llm-fallback';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let requestData: { prompt?: string; context?: string; language?: string; userLanguage?: string } = {};
  
  try {
    if (!await isAuthenticated()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'LLM service not configured' },
        { status: 503 }
      );
    }

    requestData = await request.json();
    const { prompt, context, language, userLanguage } = requestData;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = generateAssistCacheKey(prompt, context, language);
    const cachedResponse = geminiCache.get(cacheKey);
    
    if (cachedResponse) {
      console.log(`[Gemini] Cache hit for key: ${cacheKey.substring(0, 8)}...`);
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
    const result = await geminiRateLimiter.execute(async () => {
      // Set timeout for the API call
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      try {
        const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

        const languageInstructions = {
          en: 'Respond in English.',
          ko: '한국어로 답변해 주세요.',
          de: 'Bitte antworten Sie auf Deutsch.'
        };

        const systemPrompt = `You are a code assistant helping with ${language || 'code'} development. 
        Provide clean, well-structured code that follows best practices and common patterns.
        ${context ? 'Modify the existing code based on the request.' : 'Generate new code based on the request.'}
        Only return the code without explanations unless specifically asked.
        ${languageInstructions[userLanguage as keyof typeof languageInstructions] || languageInstructions.en}`;

        const userPrompt = context 
          ? `Existing code:\n\`\`\`${language}\n${context}\n\`\`\`\n\nRequest: ${prompt}`
          : prompt;

        const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-pro',
          contents: fullPrompt,
        });
        const generatedText = response.text || '';

        // Extract code from the response if it's wrapped in code blocks
        const codeMatch = generatedText.match(/```[\w]*\n([\s\S]*?)```/);
        const code = codeMatch ? codeMatch[1].trim() : generatedText.trim();

        return { code };
      } finally {
        clearTimeout(timeoutId);
      }
    });

    // Cache the successful response
    geminiCache.set(cacheKey, result, 3600000); // Cache for 1 hour
    
    return createCachedResponse(
      result,
      CacheControl.API_DETAIL,
      {
        headers: {
          'X-Cache': 'MISS',
          'X-Response-Time': `${Date.now() - startTime}ms`,
          'X-Rate-Limit-Stats': JSON.stringify(geminiRateLimiter.getStats())
        }
      }
    );
  } catch (error) {
    console.error('LLM assist error:', error);
    const err = error as Error & { status?: number; name?: string };
    
    // Try fallback provider for non-authentication errors
    if (err.status !== 401 && requestData.prompt) {
      try {
        const fallbackResult = await fallbackProvider.execute({ 
          prompt: requestData.prompt, 
          language: requestData.language 
        });
        
        return createCachedResponse(
          {
            ...fallbackResult,
            suggestions: getErrorRecoverySuggestions(err)
          },
          CacheControl.PRIVATE_NO_CACHE,
          {
            headers: {
              'X-Fallback': 'true',
              'X-Original-Error': err.message,
              'X-Response-Time': `${Date.now() - startTime}ms`
            }
          }
        );
      } catch (fallbackError) {
        console.error('Fallback provider error:', fallbackError);
      }
    }
    
    // Return more specific error messages
    if (err.name === 'AbortError') {
      return NextResponse.json(
        { 
          error: 'Request timeout - please try again',
          suggestions: getErrorRecoverySuggestions(err)
        },
        { status: 504 }
      );
    }
    
    if (err.status === 429) {
      return NextResponse.json(
        { 
          error: 'Too many requests - please try again later',
          suggestions: getErrorRecoverySuggestions(err)
        },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to process request', 
        details: err.message,
        suggestions: getErrorRecoverySuggestions(err)
      },
      { status: 500 }
    );
  }
}