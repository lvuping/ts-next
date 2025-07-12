'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { X, Trash2, Wand2, Eye, Code, Sparkles, Hash } from 'lucide-react';
import Link from 'next/link';
import { Note, NoteInput } from '@/types/note';
import { CodeDiffViewer } from '@/components/notes/code-diff-viewer';
import { AppLayout } from '@/components/layout/app-layout';
import { AppHeader } from '@/components/layout/app-header';
import { useLanguage } from '@/contexts/language-context';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { MarkdownRenderer } from '@/components/notes/markdown-renderer';
import { CategorySelector } from '@/components/ui/category-selector';
import dynamic from 'next/dynamic';
import { useGlobalSearch } from '@/hooks/use-global-search';

// Lazy load SearchDialog
const SearchDialog = dynamic(() => import('@/components/notes/search-dialog').then(mod => ({ default: mod.SearchDialog })), {
  ssr: false,
});


interface Props {
  params: Promise<{ id: string }>;
}

export default function EditNotePage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [assistPrompt, setAssistPrompt] = useState('');
  const [assistLoading, setAssistLoading] = useState(false);
  const [showDiffViewer, setShowDiffViewer] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [generatingTags, setGeneratingTags] = useState(false);
  const [summary, setSummary] = useState('');
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [formData, setFormData] = useState<Partial<NoteInput>>({
    title: '',
    content: '',
    contentFormat: 'markdown',
    language: 'markdown',
    category: 'Other',
    tags: [],
    favorite: false,
    summary: undefined,
  });
  const [categories, setCategories] = useState<Array<{ id: number; name: string; color: string; icon: string; position: number }>>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [allNotes, setAllNotes] = useState<Note[]>([]);
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

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await fetch(`/api/notes/${id}`);
        if (!response.ok) {
          throw new Error('Note not found');
        }
        const data = await response.json();
        setNote(data);
        setFormData({
          title: data.title,
          content: data.content,
          contentFormat: data.contentFormat || 'markdown',
          language: data.language,
          category: data.category,
          tags: data.tags,
          favorite: data.favorite,
          summary: data.summary,
        });
        setSummary(data.summary || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load note');
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
    
    fetchNote();
    fetchMetadata();
  }, [id]);
  
  // Only fetch all notes when search is opened
  useEffect(() => {
    if (showSearch && allNotes.length === 0) {
      fetchAllNotes();
    }
  }, [showSearch, allNotes.length]);

  // Handle AI assist from preview mode
  useEffect(() => {
    if (searchParams.get('ai-assist') === 'true') {
      const aiAssistData = sessionStorage.getItem(`ai-assist-${id}`);
      if (aiAssistData) {
        try {
          const { prompt } = JSON.parse(aiAssistData);
          setAssistPrompt(prompt);
          sessionStorage.removeItem(`ai-assist-${id}`);
        } catch (error) {
          console.error('Error processing AI assist data:', error);
        }
      }
    }
  }, [searchParams, id]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          summary: summary || formData.summary || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update note');
      }

      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete note');
      }

      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags?.includes(tagInput.trim())) {
        setFormData({
          ...formData,
          tags: [...(formData.tags || []), tagInput.trim()],
        });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tag) || [],
    });
  };

  const handleAssist = async () => {
    if (!assistPrompt.trim()) return;

    setAssistLoading(true);
    try {
      const response = await fetch('/api/llm/assist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: assistPrompt,
          context: formData.content,
          language: formData.language,
          userLanguage: language,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI assistance');
      }

      const data = await response.json();
      
      // If there's existing code content, show the diff viewer
      if (formData.content && formData.content.trim()) {
        setGeneratedCode(data.code);
        setShowDiffViewer(true);
      } else {
        // If no existing code, directly apply the generated code
        setFormData({ ...formData, content: data.code });
        setAssistPrompt('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get AI assistance');
    } finally {
      setAssistLoading(false);
    }
  };

  const handleApplyGeneratedCode = () => {
    setFormData({ ...formData, content: generatedCode });
    setAssistPrompt('');
    setGeneratedCode('');
  };

  const handleCancelGeneratedCode = () => {
    setAssistPrompt('');
    setGeneratedCode('');
  };

  const handleRegenerateCode = async () => {
    setShowDiffViewer(false);
    await handleAssist();
  };

  const handleGenerateTags = async () => {
    if (!formData.content?.trim()) return;

    setGeneratingTags(true);
    try {
      const response = await fetch('/api/llm/generate-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: formData.content,
          title: formData.title,
          language: formData.language,
          userLanguage: language,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate tags');
      }

      const data = await response.json();
      const newTags = data.tags.filter((tag: string) => !formData.tags?.includes(tag));
      
      if (newTags.length > 0) {
        setFormData({
          ...formData,
          tags: [...(formData.tags || []), ...newTags],
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate tags');
    } finally {
      setGeneratingTags(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!formData.content?.trim()) return;

    setGeneratingSummary(true);
    try {
      const response = await fetch('/api/llm/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: formData.content,
          title: formData.title,
          language: formData.language,
          userLanguage: language,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
    } finally {
      setGeneratingSummary(false);
    }
  };

  // Auto-trigger assist if coming from preview with AI assist
  useEffect(() => {
    if (searchParams.get('ai-assist') === 'true' && assistPrompt && formData.content && !assistLoading) {
      handleAssist();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assistPrompt, formData.content]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading note...</p>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Note not found</p>
          <Link href="/">
            <Button>Go to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AppLayout categories={categories} tags={tags}>
      <div className="h-full flex flex-col">
        <AppHeader 
          title="Edit Note" 
          showSearch={true}
          showThemeToggle={true}
          showLogout={true}
          onSearch={() => setShowSearch(true)}
          subtitle={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              <span className="ml-2">Delete</span>
            </Button>
          }
        />

        <main className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          <Tabs defaultValue="edit" className="flex flex-col h-full">
            <div className="px-4 md:px-6 pt-4 pb-3">
              <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="edit" className="data-[state=active]:bg-background">
                  <Code className="h-4 w-4 mr-2" />
                  Edit
                </TabsTrigger>
                <TabsTrigger value="preview" className="data-[state=active]:bg-background">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="edit" className="flex-1 flex flex-col mt-0 overflow-hidden">
              <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
                {/* Title Section */}
                <div className="px-4 md:px-6 pb-3">
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Untitled Note"
                    className="text-2xl font-bold bg-transparent border-0 px-0 focus-visible:ring-0 placeholder:text-muted-foreground/40"
                    required
                  />
                </div>

                {/* Metadata and AI Assist Bar */}
                <div className="px-4 md:px-6 pb-4 space-y-3">
                  {/* Language and Category Selectors */}
                  <div className="flex gap-3 items-center">
                    <div className="flex items-center gap-2">
                      <label htmlFor="category" className="text-sm text-muted-foreground">Category:</label>
                      <CategorySelector
                        categories={categories}
                        value={formData.category || ''}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      />
                    </div>
                  </div>

                  {/* AI Assist Bar */}
                  <div className="bg-accent/10 rounded-lg p-3 border">
                    <div className="flex gap-2 items-center">
                      <div className="flex-1 relative">
                        <Wand2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={assistPrompt}
                          onChange={(e) => setAssistPrompt(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAssist();
                            }
                          }}
                          placeholder="Ask AI to help write or modify code..."
                          className="pl-10 pr-3 bg-background/50 border-0 h-9 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary/30"
                          disabled={assistLoading}
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={handleAssist}
                        disabled={assistLoading || !assistPrompt.trim()}
                        size="sm"
                        variant="secondary"
                        className="h-9 px-4"
                      >
                        {assistLoading ? 'Generating...' : 'AI Assist'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">AI assistance powered by Gemini</p>
                  </div>
                </div>

                {/* Content Editor */}
                <div className="flex-1 px-4 md:px-6 pb-4 overflow-hidden flex flex-col">
                  <div className="flex items-center gap-2 px-1 mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Content</span>
                    <div className="flex-1 h-px bg-border/50"></div>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <RichTextEditor
                      value={formData.content || ''}
                      onChange={(content) => setFormData({ ...formData, content })}
                      contentFormat={formData.contentFormat}
                      onContentFormatChange={(format) => setFormData({ ...formData, contentFormat: format })}
                      placeholder="Start writing your code or notes..."
                      className="h-full"
                      minHeight="calc(100vh - 400px)"
                      required
                    />
                  </div>
                </div>

                {/* Tags and Actions Section */}
                <div className="px-4 md:px-6 pb-4 space-y-4 border-t">
                  {/* Tags */}
                  <div className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-muted-foreground">Tags</label>
                        {formData.tags && formData.tags.length > 0 && (
                          <span className="text-xs text-muted-foreground">({formData.tags.length})</span>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleGenerateTags}
                        disabled={generatingTags || !formData.content?.trim()}
                        className="h-7 px-2 text-xs"
                      >
                        {generatingTags ? (
                          <>Generating...</>
                        ) : (
                          <>
                            <Hash className="h-3 w-3 mr-1" />
                            Generate Tags
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags && formData.tags.length > 0 && (
                        formData.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="px-3 py-1 text-sm font-normal rounded-full hover:bg-secondary/80 transition-colors">
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-2 hover:text-destructive transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))
                      )}
                      <Input
                        id="tags"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        placeholder="Add tag..."
                        className="h-8 w-32 text-sm"
                      />
                    </div>
                  </div>

                  {/* Summary Section */}
                  {(summary || formData.content?.trim()) && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-muted-foreground">Summary</label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleGenerateSummary}
                          disabled={generatingSummary || !formData.content?.trim()}
                          className="h-7 px-2 text-xs"
                        >
                          {generatingSummary ? (
                            <>Generating...</>
                          ) : (
                            <>
                              <Sparkles className="h-3 w-3 mr-1" />
                              {summary ? 'Regenerate' : 'Generate Summary'}
                            </>
                          )}
                        </Button>
                      </div>
                      {summary && (
                        <div className="bg-muted/30 rounded-lg p-3 text-sm text-muted-foreground">
                          {summary}
                        </div>
                      )}
                    </div>
                  )}

                  {error && (
                    <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">{error}</div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/')}
                      className="px-6"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving} className="px-6">
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="preview" className="flex-1 overflow-y-auto px-4 md:px-6 pb-4">
              <div className="max-w-4xl mx-auto">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl">{formData.title || 'Untitled'}</CardTitle>
                    <CardDescription>
                      <div className="flex gap-2 mt-3">
                        <Badge variant="outline" className="px-3 py-1">{formData.category}</Badge>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {formData.content ? (
                      <div className="overflow-auto">
                        <MarkdownRenderer
                          content={formData.content}
                          className="prose prose-neutral dark:prose-invert max-w-none"
                        />
                      </div>
                    ) : (
                      <p className="text-muted-foreground py-8 text-center">No content to preview</p>
                    )}
                    {formData.tags && formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t">
                        {formData.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="px-3 py-1 rounded-full">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        </main>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CodeDiffViewer
        originalCode={formData.content || ''}
        generatedCode={generatedCode}
        language={formData.language || 'plaintext'}
        onApply={handleApplyGeneratedCode}
        onCancel={handleCancelGeneratedCode}
        onRegenerate={handleRegenerateCode}
        open={showDiffViewer}
        onOpenChange={setShowDiffViewer}
      />
      
      <SearchDialog 
        open={showSearch} 
        onOpenChange={setShowSearch} 
        notes={allNotes} 
      />
    </AppLayout>
  );
}