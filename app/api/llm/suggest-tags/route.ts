import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { title, content, language, category, existingTags } = await request.json();

    if (!title && !content) {
      return NextResponse.json(
        { error: 'Title or content is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Based on the following code/note, suggest 3-5 relevant tags that would help categorize and find this content later.

Title: ${title || 'No title'}
Language: ${language || 'Not specified'}
Category: ${category || 'Not specified'}
Existing tags in the system: ${existingTags.join(', ') || 'None'}

Content:
${content || 'No content'}

Rules:
1. Suggest tags that describe the main concepts, technologies, or purposes
2. Keep tags short (1-3 words)
3. Use lowercase only
4. Prefer existing tags from the system when relevant
5. For programming content, include relevant frameworks, libraries, or patterns
6. Be specific but not overly detailed

Return only a JSON array of suggested tags like: ["tag1", "tag2", "tag3"]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON array from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }
    
    const tags = JSON.parse(jsonMatch[0]);
    
    // Validate and clean tags
    const cleanedTags = tags
      .filter((tag: unknown) => typeof tag === 'string')
      .map((tag: string) => tag.toLowerCase().trim())
      .filter((tag: string) => tag.length > 0 && tag.length <= 50)
      .slice(0, 5);

    return NextResponse.json({ tags: cleanedTags });
  } catch (error) {
    console.error('Suggest tags error:', error);
    return NextResponse.json(
      { error: 'Failed to generate tag suggestions' },
      { status: 500 }
    );
  }
}