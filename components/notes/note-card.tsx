'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Heart, MoreVertical, Edit, Trash, Copy, Share } from 'lucide-react';
import { Note } from '@/types/note';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CodeSnippet } from './code-snippet';

interface NoteCardProps {
  note: Note;
  viewMode?: 'detailed' | 'card' | 'compact';
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
}

export function NoteCard({ note, viewMode = 'card', onDelete, onToggleFavorite }: NoteCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
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
  };

  const handleToggleFavorite = async () => {
    try {
      const response = await fetch(`/api/notes/${note.id}/favorite`, {
        method: 'POST',
      });
      
      if (response.ok && onToggleFavorite) {
        onToggleFavorite(note.id);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(note.content);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = async () => {
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
  };

  if (viewMode === 'compact') {
    return (
      <tr className="hover:bg-muted/50 transition-colors">
        <td className="p-4">
          <Link href={`/notes/edit/${note.id}`} className="font-medium hover:underline">
            {note.title}
          </Link>
        </td>
        <td className="p-4">
          <Badge variant="secondary">{note.language}</Badge>
        </td>
        <td className="p-4">
          <Badge variant="outline">{note.category}</Badge>
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
              className={note.favorite ? 'text-red-500' : ''}
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
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle>
              <Link href={`/notes/edit/${note.id}`} className="hover:underline">
                {note.title}
              </Link>
            </CardTitle>
            <CardDescription>
              {new Date(note.updatedAt).toLocaleString()}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleToggleFavorite}
              className={note.favorite ? 'text-red-500' : ''}
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
      <CardContent>
        <div className="flex gap-2 mb-3">
          <Badge>{note.language}</Badge>
          <Badge variant="outline">{note.category}</Badge>
        </div>
        {viewMode === 'detailed' && (
          <CodeSnippet 
            code={note.content} 
            language={note.language}
            className="mt-4 max-h-96"
          />
        )}
      </CardContent>
      <CardFooter>
        <div className="flex gap-1 flex-wrap">
          {note.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}