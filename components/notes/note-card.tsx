'use client';

import { memo, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Heart, MoreVertical, Edit, Trash, Copy, Share, Folder, Code, Server, Database, Cloud, Shield } from 'lucide-react';
import { Note } from '@/types/note';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CodeSnippet } from './code-snippet';
import { useViewMode } from '@/hooks/use-view-mode';
import { MarkdownPreview } from './markdown-preview';

interface NoteCardProps {
  note: Note;
  viewMode?: 'detailed' | 'card' | 'compact';
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  categories?: Array<{ id: number; name: string; color: string; icon: string; position: number }>;
}

const icons = {
  folder: Folder,
  code: Code,
  server: Server,
  database: Database,
  cloud: Cloud,
  shield: Shield,
};

function NoteCardComponent({ note, viewMode = 'card', onDelete, onToggleFavorite, categories = [] }: NoteCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const { isViewMode } = useViewMode();
  
  const noteUrl = isViewMode ? `/notes/edit/${note.id}` : `/notes/view/${note.id}`;

  const handleDelete = useCallback(async () => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok && onDelete) {
        onDelete(note.id);
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [note.id, onDelete]);

  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  const handleToggleFavorite = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isTogglingFavorite) return; // Prevent multiple clicks
    
    setIsTogglingFavorite(true);
    
    // Apply optimistic update immediately
    if (onToggleFavorite) {
      onToggleFavorite(note.id);
    }
    
    try {
      const response = await fetch(`/api/notes/${note.id}/favorite`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        // Revert optimistic update if failed
        console.error('Failed to toggle favorite status');
        if (onToggleFavorite) {
          // Revert by calling again
          onToggleFavorite(note.id);
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      // Revert optimistic update on error
      if (onToggleFavorite) {
        onToggleFavorite(note.id);
      }
    } finally {
      setIsTogglingFavorite(false);
    }
  }, [note.id, onToggleFavorite, isTogglingFavorite]);

  const handleCopyContent = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(note.content);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [note.content]);

  const handleShare = useCallback(async () => {
    const text = `${note.title}\n\n${note.content}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: note.title, text });
      } catch (error) {
        console.error('Failed to share:', error);
      }
    } else {
      handleCopyContent();
    }
  }, [note.title, note.content, handleCopyContent]);

  if (viewMode === 'compact') {
    return (
      <tr className="hover:bg-muted/50 transition-colors">
        <td className="p-4">
          <Link href={noteUrl} className="font-medium hover:underline">
            {note.title}
          </Link>
        </td>
        <td className="p-4">
          {(() => {
            const category = categories.find(cat => cat.name === note.category);
            const Icon = category ? icons[category.icon as keyof typeof icons] || Folder : Folder;
            return (
              <Badge 
                variant="outline" 
                className="flex items-center gap-1.5 w-fit"
                style={{
                  borderColor: category?.color || undefined,
                  backgroundColor: category ? category.color + '10' : undefined
                }}
              >
                {category && (
                  <Icon 
                    className="h-3 w-3" 
                    style={{ color: category.color }}
                  />
                )}
                <span style={{ color: category?.color || undefined }}>{note.category}</span>
              </Badge>
            );
          })()}
        </td>
        <td className="p-4">
          <div className="flex gap-1 flex-wrap">
            {note.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </td>
        <td className="p-4">
          {new Date(note.updatedAt).toLocaleDateString()}
        </td>
        <td className="p-4">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleToggleFavorite}
              disabled={isTogglingFavorite}
              className={`${note.favorite ? 'text-red-500' : ''} ${isTogglingFavorite ? 'opacity-50' : ''}`}
            >
              <Heart className={`h-4 w-4 ${note.favorite ? 'fill-current' : ''}`} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/notes/edit/${note.id}`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyContent}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/30 group relative overflow-hidden bg-gradient-to-br from-card to-card/95">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="line-clamp-2">
              <Link href={noteUrl} className="hover:text-primary transition-colors">
                {note.title}
              </Link>
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <span className="text-xs">{new Date(note.updatedAt).toLocaleDateString()}</span>
              <span className="text-xs text-muted-foreground/60">•</span>
              <span className="text-xs">{new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleToggleFavorite}
              disabled={isTogglingFavorite}
              className={`${note.favorite ? 'text-red-500' : ''} ${isTogglingFavorite ? 'opacity-50' : ''}`}
            >
              <Heart className={`h-4 w-4 ${note.favorite ? 'fill-current' : ''}`} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/notes/edit/${note.id}`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyContent}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="text-destructive">
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="flex gap-2 mb-3 flex-wrap">
          {(() => {
            const category = categories.find(cat => cat.name === note.category);
            const Icon = category ? icons[category.icon as keyof typeof icons] || Folder : Folder;
            return (
              <Badge 
                variant="outline" 
                className="hover:bg-secondary transition-colors flex items-center gap-1.5"
                style={{
                  borderColor: category?.color || undefined,
                  backgroundColor: category ? category.color + '10' : undefined
                }}
              >
                {category && (
                  <Icon 
                    className="h-3 w-3" 
                    style={{ color: category.color }}
                  />
                )}
                <span style={{ color: category?.color || undefined }}>{note.category}</span>
              </Badge>
            );
          })()}
        </div>
        {viewMode === 'detailed' ? (
          <div className="mt-4">
            <div className="rounded-lg border bg-muted/30 p-1">
              <CodeSnippet 
                code={note.content} 
                language="markdown"
                className="max-h-96"
              />
            </div>
          </div>
        ) : (
          <div className="mt-3">
            {note.summary ? (
              <div className="space-y-2">
                <p className="text-sm text-foreground line-clamp-2">
                  {note.summary}
                </p>
                <div className="text-xs text-muted-foreground overflow-hidden" style={{ maxHeight: '3rem' }}>
                  <MarkdownPreview 
                    content={note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '')}
                    className="prose-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground overflow-hidden" style={{ maxHeight: '4.5rem' }}>
                <MarkdownPreview 
                  content={note.content.substring(0, 150) + (note.content.length > 150 ? '...' : '')}
                  className="prose-sm"
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="relative border-t bg-muted/20">
        <div className="flex items-center justify-between w-full">
          <div className="flex gap-1 flex-wrap flex-1">
            {note.tags.length > 0 ? (
              note.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs hover:bg-secondary/80 transition-colors">
                  {tag}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground/60">No tags</span>
            )}
          </div>
          {note.favorite && (
            <Heart className="h-3 w-3 fill-red-500 text-red-500 ml-2" />
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

export const NoteCard = memo(NoteCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.note.id === nextProps.note.id &&
    prevProps.note.title === nextProps.note.title &&
    prevProps.note.content === nextProps.note.content &&
    prevProps.note.favorite === nextProps.note.favorite &&
    prevProps.note.updatedAt === nextProps.note.updatedAt &&
    prevProps.note.summary === nextProps.note.summary &&
    prevProps.viewMode === nextProps.viewMode &&
    JSON.stringify(prevProps.note.tags) === JSON.stringify(nextProps.note.tags)
  );
});