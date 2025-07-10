import { Suspense } from 'react';
import { NotesView } from './notes-view';

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotesView />
    </Suspense>
  );
}