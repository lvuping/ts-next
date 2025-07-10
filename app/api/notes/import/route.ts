import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { importNotes } from '@/lib/notes';

export async function POST(request: NextRequest) {
  try {
    if (!await isAuthenticated()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const content = await file.text();
    const result = await importNotes(content);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error importing notes:', error);
    return NextResponse.json(
      { error: 'Failed to import notes' },
      { status: 500 }
    );
  }
}