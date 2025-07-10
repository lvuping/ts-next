import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { isAuthenticated } from '@/lib/auth';
import { env } from '@/lib/env';

export async function POST(request: NextRequest) {
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

    const client = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });

    const completion = await client.chat.completions.create({
      model: model || 'gpt-4.1',
      messages: messages
    });

    const content = completion.choices[0]?.message?.content || '';

    return NextResponse.json({ content });
  } catch (error) {
    console.error('ChatGPT assist error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}