import { Suspense } from 'react';
import { NotesView } from './notes-view';
import { LoadingSpinner } from '@/components/ui/spinner';

// Configure revalidation for the home page (1 minute)
export const revalidate = 60;

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <NotesView />
    </Suspense>
  );
}