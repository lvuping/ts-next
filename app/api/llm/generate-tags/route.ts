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

    if (!content && !title) {
      return NextResponse.json(
        { error: 'Content or title is required' },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

    const languageInstructions = {
      en: 'Generate 3-5 relevant tags in English that describe the main topics, technologies, concepts, or frameworks used.\nReturn only the tags as a comma-separated list, no explanations.',
      ko: '주요 주제, 기술, 개념 또는 사용된 프레임워크를 설명하는 3-5개의 관련 태그를 한국어로 생성하세요.\n설명 없이 쉼표로 구분된 태그 목록만 반환하세요.',
      de: 'Generieren Sie 3-5 relevante Tags auf Deutsch, die die Hauptthemen, Technologien, Konzepte oder verwendeten Frameworks beschreiben.\nGeben Sie nur die Tags als kommagetrennte Liste zurück, keine Erklärungen.'
    };

    const prompt = `Analyze the following ${language || 'code'} snippet and generate relevant tags.
Title: ${title || 'Untitled'}
Content: ${content || ''}

${languageInstructions[userLanguage as keyof typeof languageInstructions] || languageInstructions.en}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const text = response.text || '';
    const tags = text.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Generate tags error:', error);
    return NextResponse.json(
      { error: 'Failed to generate tags' },
      { status: 500 }
    );
  }
}