import { Suspense } from 'react';
import { NotesView } from './notes-view';
import { LoadingSpinner } from '@/components/ui/spinner';

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <NotesView />
    </Suspense>
  );
}