'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { NoteCard } from '@/components/notes/note-card';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ThemeToggle } from '@/components/theme-toggle';
import { SearchDialog } from '@/components/notes/search-dialog';
import { StatsCard } from '@/components/notes/stats-card';
import { LayoutGrid, List, TableIcon, LogOut, Search, BarChart3, Download, Upload } from 'lucide-react';
import { Note } from '@/types/note';
import { useRouter } from 'next/navigation';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useDoubleKeyPress } from '@/hooks/use-double-key-press';
import { ExportDialog } from '@/components/notes/export-dialog';
import { ImportDialog } from '@/components/notes/import-dialog';

type ViewMode = 'detailed' | 'card' | 'compact';

export function NotesView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Array<{ id: number; name: string; color: string; icon: string; position: number }>>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);

  // Use double Control key press for search
  useDoubleKeyPress({
    key: 'Control',
    handler: () => setShowSearch(true),
    timeout: 400
  });

  // Keep other keyboard shortcuts
  useKeyboardShortcuts([
    { key: '/', handler: () => setShowSearch(true) },
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
    const fetchNotes = async () => {
      try {
        const params = new URLSearchParams(searchParams);
        const response = await fetch(`/api/notes?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setNotes(data);
        }
      } catch (error) {
        console.error('Failed to fetch notes:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchMetadata = async () => {
      try {
        const response = await fetch('/api/notes/metadata');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories);
          setTags(data.tags);
        }
      } catch (error) {
        console.error('Failed to fetch metadata:', error);
      }
    };
    
    fetchNotes();
    fetchMetadata();
  }, [searchParams]);


  const handleViewModeChange = (value: string) => {
    if (value) {
      setViewMode(value as ViewMode);
      localStorage.setItem('viewMode', value);
    }
  };

  const handleDelete = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const handleToggleFavorite = (id: string) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, favorite: !note.favorite } : note
    ));
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      router.push('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const activeFilter = searchParams.get('category') || searchParams.get('tag') || 
                       (searchParams.get('favorite') === 'true' ? 'Favorites' : null) ||
                       (searchParams.get('search') ? `Search: ${searchParams.get('search')}` : null);

  return (
    <AppLayout categories={categories} tags={tags}>
      <div className="h-full flex flex-col">
        <header className="border-b px-4 py-2 md:px-6 md:py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Notes PKM</h1>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowSearch(true)}
                title="Search notes (Double tap Control)"
              >
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setShowStats(!showStats)}>
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowExport(true)}
                title="Export notes"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowImport(true)}
                title="Import notes"
              >
                <Upload className="h-4 w-4" />
              </Button>
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                {notes.length} {notes.length === 1 ? 'note' : 'notes'} found
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
        </header>
        
        <div className="flex-1 overflow-auto p-4 md:p-6">
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
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <p className="text-muted-foreground">No notes found</p>
              <Button onClick={() => router.push('/notes/new')}>
                Create your first note
              </Button>
            </div>
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
                  {notes.map((note) => (
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
            <div className={`grid gap-4 ${viewMode === 'detailed' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  viewMode={viewMode}
                  onDelete={handleDelete}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
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