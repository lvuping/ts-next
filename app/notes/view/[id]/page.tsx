import { notFound } from 'next/navigation';
import { getNoteById, getCategories } from '@/lib/notes';
import { ViewWrapper } from './view-wrapper';
import { ViewNoteContent } from '@/components/notes/view-note-content';
import { getRecentNoteIds, getPopularNoteIds } from '@/lib/notes-isr';

// Enable ISR with 60 seconds revalidation
export const revalidate = 60;

// Allow dynamic params beyond the ones pre-generated
export const dynamicParams = true;

// Pre-generate static pages for recent and popular notes
export async function generateStaticParams() {
  const [recentNotes, popularNotes] = await Promise.all([
    getRecentNoteIds(5),
    getPopularNoteIds(5)
  ]);

  // Combine and deduplicate note IDs
  const noteIds = [...recentNotes, ...popularNotes];
  const uniqueNoteIds = Array.from(
    new Map(noteIds.map(item => [item.id, item])).values()
  );

  return uniqueNoteIds;
}

export default async function ViewNotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [note, categories] = await Promise.all([
    getNoteById(id),
    getCategories()
  ]);

  if (!note) {
    notFound();
  }

  return (
    <ViewWrapper>
      <ViewNoteContent note={note} categories={categories} />
    </ViewWrapper>
  );
}