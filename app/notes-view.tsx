'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
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
import { useNotes, useToggleFavorite } from '@/src/hooks/queries/use-notes';
import { useCategories } from '@/src/hooks/queries/use-categories';
import { useTags } from '@/src/hooks/queries/use-tags';

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
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [loadingMore, setLoadingMore] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  // Parse search params for filters
  const filters = {
    search: searchParams.get('search') || undefined,
    category: searchParams.get('category') || undefined,
    tag: searchParams.get('tag') || undefined,
    favorite: searchParams.get('favorite') === 'true' ? true : undefined,
    sortBy: (searchParams.get('sortBy') as 'createdAt' | 'updatedAt' | 'title' | undefined) || undefined,
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc' | undefined) || undefined,
    limit: NOTES_PER_PAGE,
    offset: currentPage * NOTES_PER_PAGE,
  };
  
  // Use React Query hooks
  const { data: notesData, isLoading: notesLoading } = useNotes(filters);
  const { data: categoriesData } = useCategories();
  const { data: tagsData } = useTags();
  const toggleFavoriteMutation = useToggleFavorite();
  
  const notes = useMemo(() => notesData?.notes || [], [notesData?.notes]);
  const totalNotes = notesData?.total || 0;
  const categories = categoriesData || [];
  const tags = tagsData || [];
  const hasMore = allNotes.length < totalNotes;
  const loading = notesLoading && currentPage === 0;

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

  // Reset pagination when search params change
  useEffect(() => {
    setCurrentPage(0);
    setAllNotes([]);
  }, [searchParams]);
  
  // Update accumulated notes when data changes
  useEffect(() => {
    if (currentPage === 0) {
      setAllNotes(notes);
    } else if (notes.length > 0 && !allNotes.some(n => n.id === notes[0].id)) {
      setAllNotes(prev => [...prev, ...notes]);
    }
  }, [notes, currentPage, allNotes]);

  // Load more notes when reaching the bottom
  const loadMoreNotes = useCallback(() => {
    if (loadingMore || !hasMore || notesLoading) return;
    
    setLoadingMore(true);
    setCurrentPage(prev => prev + 1);
    // Loading state will be handled by React Query
    setTimeout(() => setLoadingMore(false), 100);
  }, [hasMore, loadingMore, notesLoading]);

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
    setAllNotes(prev => prev.filter(note => note.id !== id));
  };

  const handleToggleFavorite = useCallback((id: string) => {
    toggleFavoriteMutation.mutate(id);
    // Optimistically update local state
    setAllNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === id ? { ...note, favorite: !note.favorite } : note
      )
    );
  }, [toggleFavoriteMutation]);


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
                  Showing {allNotes.length} of {totalNotes} {totalNotes === 1 ? 'note' : 'notes'}
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
              <StatsCard notes={allNotes} categories={categories} tags={tags} />
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading notes...</p>
            </div>
          ) : allNotes.length === 0 ? (
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
                    <th className="text-left p-4">Category</th>
                    <th className="text-left p-4">Tags</th>
                    <th className="text-left p-4">Updated</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      viewMode={viewMode}
                      onDelete={handleDelete}
                      onToggleFavorite={handleToggleFavorite}
                      categories={categories}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <>
              <div className={`grid gap-6 ${viewMode === 'detailed' ? 'grid-cols-1 max-w-4xl mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                {allNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    viewMode={viewMode}
                    onDelete={handleDelete}
                    onToggleFavorite={handleToggleFavorite}
                    categories={categories}
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
        notes={allNotes} 
      />
      
      <ExportDialog
        open={showExport}
        onOpenChange={setShowExport}
        notes={allNotes}
      />
      
      <ImportDialog
        open={showImport}
        onOpenChange={setShowImport}
      />
    </AppLayout>
  );
}