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
        { error: 'Gemini API not configured' },
        { status: 503 }
      );
    }

    const { content, title, language, userLanguage = 'en' } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

    const languageInstructions = {
      en: 'Provide a clear, concise summary in English that captures the main purpose and functionality.',
      ko: '주요 목적과 기능을 포착하는 명확하고 간결한 한국어 요약을 제공하세요.',
      de: 'Geben Sie eine klare, prägnante Zusammenfassung auf Deutsch, die den Hauptzweck und die Funktionalität erfasst.'
    };

    const prompt = `Summarize the following ${language || 'code'} snippet in 2-3 sentences.
Title: ${title || 'Untitled'}
Content: ${content}

${languageInstructions[userLanguage as keyof typeof languageInstructions] || languageInstructions.en}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const summary = response.text || '';

    return NextResponse.json({ summary: summary.trim() });
  } catch (error) {
    console.error('Generate summary error:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}