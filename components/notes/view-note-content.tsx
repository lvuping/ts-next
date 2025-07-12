'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Edit, Heart, X, Wand2, FileText, Loader2, Folder, Code, Server, Database, Cloud, Shield } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import Link from 'next/link';
import { MarkdownRenderer } from '@/components/notes/markdown-renderer';
import { Note } from '@/types/note';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/contexts/language-context';
import { useGlobalSearch } from '@/hooks/use-global-search';

// Lazy load SearchDialog
const SearchDialog = dynamic(() => import('@/components/notes/search-dialog').then(mod => ({ default: mod.SearchDialog })), {
  ssr: false,
});

interface ViewNoteContentProps {
  note: Note;
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

export function ViewNoteContent({ note, categories = [] }: ViewNoteContentProps) {
  const [assistPrompt, setAssistPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState(note.summary || '');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  const { language } = useLanguage();
  const { showSearch, setShowSearch } = useGlobalSearch();

  const fetchAllNotes = async () => {
    try {
      const response = await fetch('/api/notes');
      if (response.ok) {
        const data = await response.json();
        setAllNotes(data);
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    }
  };
  
  // Only fetch all notes when search is opened
  useEffect(() => {
    if (showSearch && allNotes.length === 0) {
      fetchAllNotes();
    }
  }, [showSearch, allNotes.length]);

  const handleAssist = async () => {
    if (!assistPrompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a prompt for the AI assistant',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Store the prompt in sessionStorage to pass to edit mode
      sessionStorage.setItem(`ai-assist-${note.id}`, JSON.stringify({
        prompt: assistPrompt.trim(),
        originalContent: note.content,
        timestamp: Date.now()
      }));
      
      // Navigate to edit mode
      router.push(`/notes/edit/${note.id}?ai-assist=true`);
    } catch (error) {
      console.error('AI assist error:', error);
      toast({
        title: 'Error',
        description: 'Failed to process AI assistance request',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    
    try {
      const response = await fetch('/api/llm/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: note.content,
          title: note.title,
          language: note.language,
          userLanguage: language,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to summarize');
      }

      const data = await response.json();
      setSummary(data.summary);
      
      // Save the summary to the database
      const updateResponse = await fetch(`/api/notes/${note.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...note,
          summary: data.summary,
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to save summary');
      }

      toast({
        title: 'Success',
        description: 'Summary generated and saved successfully',
      });
    } catch (error) {
      console.error('Summarize error:', error);
      toast({
        title: 'Error',
        description: 'Failed to summarize the note',
        variant: 'destructive',
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <AppHeader 
        title="View Note" 
        showSearch={true}
        showThemeToggle={true}
        showLogout={true}
        onSearch={() => setShowSearch(true)}
        subtitle={
          <Link href={`/notes/edit/${note.id}`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        }
      />

      <main className="flex-1 overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
        <div className="max-w-7xl mx-auto h-full flex flex-col overflow-y-auto">
          {/* Title Section */}
          <div className="px-8 pt-6 pb-3">
            <h2 className="text-3xl font-bold tracking-tight">{note.title}</h2>
          </div>

          {/* Metadata Section */}
          <div className="px-8 pb-4 space-y-3">
            {/* Language and Category */}
            <div className="flex gap-3 items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Category:</span>
                {(() => {
                  const category = categories.find(cat => cat.name === note.category);
                  const Icon = category ? icons[category.icon as keyof typeof icons] || Folder : Folder;
                  return (
                    <Badge 
                      variant="secondary" 
                      className="text-sm flex items-center gap-1.5"
                      style={{
                        borderColor: category?.color || undefined,
                        backgroundColor: category ? category.color + '10' : undefined
                      }}
                    >
                      {category && (
                        <Icon 
                          className="h-3.5 w-3.5" 
                          style={{ color: category.color }}
                        />
                      )}
                      <span style={{ color: category?.color || undefined }}>{note.category}</span>
                    </Badge>
                  );
                })()}
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

            {/* AI Assistant Input */}
            <div className="bg-gradient-to-r from-accent/20 to-accent/10 rounded-xl p-4 border border-accent/30 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">AI Assistant</p>
                  <p className="text-xs text-muted-foreground">Get help understanding or modifying this code</p>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Wand2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={assistPrompt}
                      onChange={(e) => setAssistPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAssist();
                        }
                      }}
                      placeholder="Ask AI to help modify or explain this code..."
                      className="pl-10 pr-3 h-9 text-sm"
                      disabled={isProcessing}
                    />
                  </div>
                  <Button
                    onClick={handleSummarize}
                    disabled={isSummarizing}
                    size="sm"
                    variant="outline"
                    className="h-9"
                  >
                    {isSummarizing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <><FileText className="h-4 w-4 mr-1" />Summarize</>
                    )}
                  </Button>
                  <Button
                    onClick={handleAssist}
                    disabled={isProcessing || !assistPrompt.trim()}
                    size="sm"
                    className="h-9"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'AI Assist'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 px-8 pb-6">
            <div className="space-y-2">
              {/* Summary Section */}
              {summary && (
                <div className="mb-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Summary
                      </h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{summary}</p>
                    </div>
                    <Button
                      onClick={() => setSummary('')}
                      size="sm"
                      variant="ghost"
                      className="ml-2 h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 px-1">
                <span className="text-sm font-medium text-muted-foreground">Content</span>
                <div className="flex-1 h-px bg-border/50"></div>
              </div>
              <div className="h-full bg-gradient-to-b from-background to-background/80 rounded-xl shadow-lg border-2 border-border/50 hover:border-primary/30 transition-all duration-300 ring-1 ring-black/5 dark:ring-white/10">
                <div className="h-full p-1">
                  <div className="p-6 overflow-auto h-full bg-background">
                    {note.contentFormat === 'rich' ? (
                      <div 
                        className="prose prose-neutral dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: note.content }}
                      />
                    ) : (
                      <MarkdownRenderer
                        content={note.content}
                        className="prose prose-neutral dark:prose-invert max-w-none"
                      />
                    )}
                  </div>
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

      <SearchDialog 
        open={showSearch} 
        onOpenChange={setShowSearch} 
        notes={allNotes} 
      />
    </div>
  );
}