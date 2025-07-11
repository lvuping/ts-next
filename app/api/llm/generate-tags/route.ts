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

    const { content, title, language } = await request.json();

    if (!content && !title) {
      return NextResponse.json(
        { error: 'Content or title is required' },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

    const prompt = `Analyze the following ${language || 'code'} snippet and generate relevant tags.
Title: ${title || 'Untitled'}
Content: ${content || ''}

Generate 3-5 relevant tags that describe the main topics, technologies, concepts, or frameworks used.
Return only the tags as a comma-separated list, no explanations.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
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