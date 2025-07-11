import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({});

export async function POST(request: NextRequest) {
  try {
    const { content, title, language, userLanguage } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const languageInstructions = {
      en: 'Please respond in English.',
      ko: '한국어로 답변해 주세요.',
      de: 'Bitte antworten Sie auf Deutsch.'
    };

    const prompt = `Please provide a concise summary of the following ${language} code/note.
    
Title: ${title}
Language: ${language}

Content:
${content}

Provide a 2-3 sentence summary that captures the main purpose and key functionality of this code/note. Focus on what the code does and its primary use case.

${languageInstructions[userLanguage as keyof typeof languageInstructions] || languageInstructions.en}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const summary = response.text || '';

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Summarize error:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}