import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getCategories, getTags } from '@/lib/notes';

export async function GET() {
  try {
    if (!await isAuthenticated()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [categories, tags] = await Promise.all([
      getCategories(),
      getTags()
    ]);
    
    return NextResponse.json({ categories, tags });
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metadata' },
      { status: 500 }
    );
  }
}