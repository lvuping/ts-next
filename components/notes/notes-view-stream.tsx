'use client';

import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { NoteCard } from '@/components/notes/note-card';
import { useNotesStream } from '@/hooks/use-notes-stream';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

interface NotesViewStreamProps {
  search?: string;
  category?: string;
  tag?: string;
  favorite?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

export function NotesViewStream({
  search,
  category,
  tag,
  favorite,
  sortBy = 'updatedAt',
  sortOrder = 'desc',
  limit = 100,
}: NotesViewStreamProps) {
  const { notes, total, loading, error, fetchNotesStream } = useNotesStream({
    onProgress: (loaded, total) => {
      console.log(`Loaded ${loaded} of ${total} notes`);
    }
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (tag) params.set('tag', tag);
    if (favorite !== undefined) params.set('favorite', String(favorite));
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    params.set('limit', String(limit));

    fetchNotesStream(params);
  }, [search, category, tag, favorite, sortBy, sortOrder, limit, fetchNotesStream]);

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-destructive">Error loading notes: {error}</p>
      </Card>
    );
  }

  if (loading && notes.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-48">
              <div className="p-6 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {loading && notes.length > 0 && (
        <div className="mb-4">
          <Progress value={(notes.length / total) * 100} className="w-full" />
          <p className="text-sm text-muted-foreground mt-1">
            Loading notes... {notes.length} / {total}
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>

      {!loading && notes.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            {search ? `No notes found matching "${search}"` : 'No notes yet. Create your first note!'}
          </p>
        </Card>
      )}

      {!loading && notes.length > 0 && (
        <p className="text-sm text-muted-foreground mt-4 text-center">
          Showing {notes.length} of {total} notes
        </p>
      )}
    </div>
  );
}