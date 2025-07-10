'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Hash, FolderOpen, Clock } from 'lucide-react';
import Fuse from 'fuse.js';
import { Note } from '@/types/note';
import { useViewMode } from '@/hooks/use-view-mode';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notes: Note[];
}

export function SearchDialog({ open, onOpenChange, notes }: SearchDialogProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Note[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const fuse = new Fuse(notes, {
      keys: ['title', 'content', 'tags', 'category'],
      threshold: 0.3,
      includeScore: true,
      sortFn: (a, b) => a.score - b.score,
    });
    
    if (searchQuery.trim()) {
      const searchResults = fuse.search(searchQuery);
      setResults(searchResults.slice(0, 8).map(result => result.item));
    } else {
      setResults(notes.slice(0, 8));
    }
    setSelectedIndex(0);
  }, [searchQuery, notes]);

  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelectNote(results[selectedIndex]);
    }
  };

  const { isViewMode } = useViewMode();
  
  const handleSelectNote = (note: Note) => {
    const url = isViewMode ? `/notes/edit/${note.id}` : `/notes/view/${note.id}`;
    router.push(url);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="sr-only">Search Notes</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search notes by title, content, tags..."
              className="pl-9"
              autoFocus
            />
          </div>
          
          {results.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((note, index) => (
                <div
                  key={note.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    index === selectedIndex
                      ? 'bg-accent'
                      : 'hover:bg-accent/50'
                  }`}
                  onClick={() => handleSelectNote(note)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{note.title}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FolderOpen className="h-3 w-3" />
                          {note.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          {note.tags.length} tags
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(note.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary">{note.language}</Badge>
                  </div>
                  {note.content && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {note.content}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No notes found
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">↑</kbd>
                <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">↵</kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Esc</kbd>
                Close
              </span>
            </div>
            <span>{results.length} results</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}