'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Edit, Heart, X } from 'lucide-react';
import Link from 'next/link';
import { CodeSnippet } from '@/components/notes/code-snippet';
import { AIAssistant } from '@/components/notes/ai-assistant';
import { Note } from '@/types/note';
import { useState } from 'react';

interface ViewNoteContentProps {
  note: Note;
}

export function ViewNoteContent({ note }: ViewNoteContentProps) {
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b-2 border-border/50 px-6 py-4 flex-shrink-0 bg-gradient-to-r from-background to-background/95 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">View Note</h1>
          <Link href={`/notes/edit/${note.id}`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-background to-primary/5">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          {/* Title Section */}
          <div className="px-8 pt-6 pb-3">
            <h2 className="text-3xl font-bold tracking-tight">{note.title}</h2>
          </div>

          {/* Metadata Section */}
          <div className="px-8 pb-4 space-y-3">
            {/* Language and Category */}
            <div className="flex gap-3 items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Language:</span>
                <Badge variant="outline" className="text-sm">{note.language}</Badge>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Category:</span>
                <Badge variant="secondary" className="text-sm">{note.category}</Badge>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {new Date(note.createdAt).toLocaleDateString()}
                </span>
                {note.favorite && (
                  <Heart className="h-4 w-4 fill-red-500 text-red-500 ml-2" />
                )}
              </div>
            </div>

            {/* AI Assistant Toggle */}
            <div className="bg-gradient-to-r from-accent/20 to-accent/10 rounded-xl p-4 border border-accent/30 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">AI Assistant</p>
                  <p className="text-xs text-muted-foreground">Get help understanding or modifying this code</p>
                </div>
                <Button
                  onClick={() => setShowAIAssistant(!showAIAssistant)}
                  variant="secondary"
                  size="sm"
                >
                  {showAIAssistant ? 'Hide Assistant' : 'Show Assistant'}
                </Button>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 px-8 pb-6 min-h-[500px]">
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <span className="text-sm font-medium text-muted-foreground">Content</span>
                <div className="flex-1 h-px bg-border/50"></div>
              </div>
              <div className="h-full bg-gradient-to-b from-background to-background/80 rounded-xl shadow-lg border-2 border-border/50 hover:border-primary/30 transition-all duration-300 ring-1 ring-black/5 dark:ring-white/10">
                <div className="h-full p-1">
                  <CodeSnippet
                    code={note.content}
                    language={note.language}
                    className="h-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tags Section */}
          {note.tags.length > 0 && (
            <div className="px-8 pb-6 border-t-2 border-border/30 bg-gradient-to-b from-background/50 to-background/30">
              <div className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-medium text-muted-foreground">Tags</label>
                  <span className="text-xs text-muted-foreground">({note.tags.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {note.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="px-3 py-1 text-sm font-normal rounded-full">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* AI Assistant Modal/Drawer */}
      {showAIAssistant && (
        <div className="fixed inset-x-0 bottom-0 z-50 bg-background border-t-2 border-border shadow-2xl animate-in slide-in-from-bottom-2 duration-300">
          <div className="max-w-7xl mx-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">AI Assistant</h3>
              <Button
                onClick={() => setShowAIAssistant(false)}
                variant="ghost"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <AIAssistant noteId={note.id} noteContent={note.content} />
          </div>
        </div>
      )}
    </div>
  );
}