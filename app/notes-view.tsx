'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { NoteCard } from '@/components/notes/note-card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { AppHeader } from '@/components/layout/app-header';
import { LayoutGrid, List, TableIcon, Loader2 } from 'lucide-react';
import { Note } from '@/types/note';
import { useRouter } from 'next/navigation';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { EmptyState } from '@/components/ui/empty-state';
import dynamic from 'next/dynamic';
import { FileText } from 'lucide-react';

// Lazy load heavy components
const SearchDialog = dynamic(() => import('@/components/notes/search-dialog').then(mod => ({ default: mod.SearchDialog })), {
  ssr: false,
});

const StatsCard = dynamic(() => import('@/components/notes/stats-card').then(mod => ({ default: mod.StatsCard })), {
  ssr: false,
  loading: () => <div className="h-32 bg-muted animate-pulse rounded-lg" />,
});

const ExportDialog = dynamic(() => import('@/components/notes/export-dialog').then(mod => ({ default: mod.ExportDialog })), {
  ssr: false,
});

const ImportDialog = dynamic(() => import('@/components/notes/import-dialog').then(mod => ({ default: mod.ImportDialog })), {
  ssr: false,
});

type ViewMode = 'detailed' | 'card' | 'compact';

const NOTES_PER_PAGE = 12;

export function NotesView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [displayedNotes, setDisplayedNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Array<{ id: number; name: string; color: string; icon: string; position: number }>>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcuts including platform-specific search trigger
  useKeyboardShortcuts([
    { key: '/', handler: () => setShowSearch(true) },
    { 
      key: ' ', // Space key
      handler: () => setShowSearch(true),
      platformSpecific: {
        mac: { metaKey: true }, // Command+Space on Mac
        windows: { altKey: true } // Alt+Space on Windows
      }
    },
    { key: 'n', ctrlKey: true, handler: () => router.push('/notes/new') },
    { key: 's', ctrlKey: true, shiftKey: true, handler: () => setShowStats(!showStats) },
  ]);

  useEffect(() => {
    const savedViewMode = localStorage.getItem('viewMode') as ViewMode;
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams(searchParams);
        // Parallel API calls
        const [notesResponse, metadataResponse] = await Promise.all([
          fetch(`/api/notes?${params.toString()}`),
          fetch('/api/notes/metadata')
        ]);

        if (notesResponse.ok) {
          const data = await notesResponse.json();
          setNotes(data);
          // Initially display first batch
          setDisplayedNotes(data.slice(0, NOTES_PER_PAGE));
          setHasMore(data.length > NOTES_PER_PAGE);
        }

        if (metadataResponse.ok) {
          const data = await metadataResponse.json();
          setCategories(data.categories);
          setTags(data.tags);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [searchParams]);

  // Load more notes when reaching the bottom
  const loadMoreNotes = useCallback(() => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    setTimeout(() => {
      const currentLength = displayedNotes.length;
      const nextBatch = notes.slice(currentLength, currentLength + NOTES_PER_PAGE);
      setDisplayedNotes(prev => [...prev, ...nextBatch]);
      setHasMore(currentLength + nextBatch.length < notes.length);
      setLoadingMore(false);
    }, 300); // Small delay to show loading state
  }, [displayedNotes.length, notes, hasMore, loadingMore]);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (loading) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMoreNotes();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, hasMore, loadingMore, loadMoreNotes]);


  const handleViewModeChange = (value: string) => {
    if (value) {
      setViewMode(value as ViewMode);
      localStorage.setItem('viewMode', value);
    }
  };

  const handleDelete = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    setDisplayedNotes(displayedNotes.filter(note => note.id !== id));
  };

  const handleToggleFavorite = (id: string) => {
    const updateNote = (note: Note) => 
      note.id === id ? { ...note, favorite: !note.favorite } : note;
    
    setNotes(notes.map(updateNote));
    setDisplayedNotes(displayedNotes.map(updateNote));
  };


  const activeFilter = searchParams.get('category') || searchParams.get('tag') || 
                       (searchParams.get('favorite') === 'true' ? 'Favorites' : null) ||
                       (searchParams.get('search') ? `Search: ${searchParams.get('search')}` : null);

  return (
    <AppLayout categories={categories} tags={tags}>
      <div className="h-full flex flex-col">
        <AppHeader
          title="Notes PKM"
          showSearch
          showStats
          showExport
          showImport
          onSearch={() => setShowSearch(true)}
          onStats={() => setShowStats(!showStats)}
          onExport={() => setShowExport(true)}
          onImport={() => setShowImport(true)}
          subtitle={
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  Showing {displayedNotes.length} of {notes.length} {notes.length === 1 ? 'note' : 'notes'}
                  {activeFilter && (
                    <span> • Filtered by: <span className="font-medium">{activeFilter}</span></span>
                  )}
                </p>
              </div>
              
              <ToggleGroup 
                type="single" 
                value={viewMode} 
                onValueChange={handleViewModeChange}
              >
                <ToggleGroupItem value="detailed" aria-label="Detailed view">
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="card" aria-label="Card view">
                  <LayoutGrid className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="compact" aria-label="Compact view">
                  <TableIcon className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          }
        />
        
        <div className="flex-1 overflow-auto p-4 md:p-6 bg-gradient-to-br from-background via-background to-primary/5">
          {showStats && (
            <div className="mb-6 animate-fade-in">
              <StatsCard notes={notes} categories={categories} tags={tags} />
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading notes...</p>
            </div>
          ) : notes.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No notes found"
              description="Start creating notes to organize your knowledge"
              action={{
                label: "Create your first note",
                onClick: () => router.push('/notes/new')
              }}
            />
          ) : viewMode === 'compact' ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Title</th>
                    <th className="text-left p-4">Language</th>
                    <th className="text-left p-4">Category</th>
                    <th className="text-left p-4">Tags</th>
                    <th className="text-left p-4">Updated</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      viewMode={viewMode}
                      onDelete={handleDelete}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <>
              <div className={`grid gap-6 ${viewMode === 'detailed' ? 'grid-cols-1 max-w-4xl mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                {displayedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    viewMode={viewMode}
                    onDelete={handleDelete}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
              {/* Load more trigger */}
              {hasMore && (
                <div 
                  ref={loadMoreRef} 
                  className="flex justify-center py-8"
                >
                  {loadingMore && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Loading more notes...</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <SearchDialog 
        open={showSearch} 
        onOpenChange={setShowSearch} 
        notes={notes} 
      />
      
      <ExportDialog
        open={showExport}
        onOpenChange={setShowExport}
        notes={notes}
      />
      
      <ImportDialog
        open={showImport}
        onOpenChange={setShowImport}
      />
    </AppLayout>
  );
}