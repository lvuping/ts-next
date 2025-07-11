import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { isAuthenticated } from '@/lib/auth';
import { env } from '@/lib/env';

export async function POST(request: NextRequest) {
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

    const { prompt, context, language } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

    const systemPrompt = `You are a code assistant helping with ${language || 'code'} development. 
    Provide clean, well-structured code that follows best practices and common patterns.
    ${context ? 'Modify the existing code based on the request.' : 'Generate new code based on the request.'}
    Only return the code without explanations unless specifically asked.`;

    const userPrompt = context 
      ? `Existing code:\n\`\`\`${language}\n${context}\n\`\`\`\n\nRequest: ${prompt}`
      : prompt;

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });
    const generatedText = response.text || '';

    // Extract code from the response if it's wrapped in code blocks
    const codeMatch = generatedText.match(/```[\w]*\n([\s\S]*?)```/);
    const code = codeMatch ? codeMatch[1].trim() : generatedText.trim();

    return NextResponse.json({ code });
  } catch (error) {
    console.error('LLM assist error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}