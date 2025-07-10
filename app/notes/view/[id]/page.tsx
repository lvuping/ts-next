import { notFound } from 'next/navigation';
import { getNoteById } from '@/lib/notes';
import { ViewWrapper } from './view-wrapper';
import { ViewNoteContent } from '@/components/notes/view-note-content';

export default async function ViewNotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const note = await getNoteById(id);

  if (!note) {
    notFound();
  }

  return (
    <ViewWrapper>
      <ViewNoteContent note={note} />
    </ViewWrapper>
  );
}