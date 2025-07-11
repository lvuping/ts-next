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

    const { model: modelName, contents } = await request.json();

    if (!contents) {
      return NextResponse.json(
        { error: 'Contents is required' },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: modelName || 'gemini-2.5-flash',
      contents: contents
    });
    const text = response.text;

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}