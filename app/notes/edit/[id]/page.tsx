'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { X, Trash2, Wand2, Eye, Code } from 'lucide-react';
import Link from 'next/link';
import { Note, NoteInput } from '@/types/note';
import { CodeSnippet } from '@/components/notes/code-snippet';
import { CodeDiffViewer } from '@/components/notes/code-diff-viewer';
import { AppLayout } from '@/components/layout/app-layout';

const LANGUAGES = [
  'plaintext', 'abap', 'javascript', 'typescript', 'python', 'java', 'csharp', 'cpp', 
  'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'sql', 'html', 'css', 'scss', 
  'json', 'yaml', 'xml', 'markdown', 'bash', 'shell'
];

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditNotePage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [formData, setFormData] = useState<Partial<NoteInput>>({
    title: '',
    content: '',
    language: 'plaintext',
    category: 'Other',
    tags: [],
    favorite: false,
  });
  const [categories, setCategories] = useState<Array<{ id: number; name: string; color: string; icon: string; position: number }>>([]);
  const [tags, setTags] = useState<string[]>([]);

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
          language: data.language,
          category: data.category,
          tags: data.tags,
          favorite: data.favorite,
        });
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
        body: JSON.stringify(formData),
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
      <div className="min-h-screen bg-background">
        <header className="border-b p-4 md:p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Edit Note</h1>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </header>

        <main className="container max-w-6xl mx-auto p-4 md:p-6">
        <Tabs defaultValue="edit" className="space-y-4">
          <TabsList>
            <TabsTrigger value="edit">
              <Code className="h-4 w-4 mr-2" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit">
            <Card>
              <CardHeader>
                <CardTitle>Note Details</CardTitle>
                <CardDescription>
                  Edit your note
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter note title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>AI Assistant</Label>
                    <div className="flex gap-2">
                      <Input
                        value={assistPrompt}
                        onChange={(e) => setAssistPrompt(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAssist();
                          }
                        }}
                        placeholder="Describe how to modify the code..."
                        disabled={assistLoading}
                      />
                      <Button
                        type="button"
                        onClick={handleAssist}
                        disabled={assistLoading || !assistPrompt.trim()}
                      >
                        <Wand2 className="h-4 w-4 mr-2" />
                        {assistLoading ? 'Processing...' : 'Assist'}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="language">Language *</Label>
                        <Select
                          value={formData.language}
                          onValueChange={(value) => setFormData({ ...formData, language: value })}
                        >
                          <SelectTrigger id="language">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LANGUAGES.map((lang) => (
                              <SelectItem key={lang} value={lang}>
                                {lang}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger id="category">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.name}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="content">Content *</Label>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Enter your content here..."
                        className="font-mono min-h-[400px]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="Type tag and press Enter"
                    />
                    {formData.tags && formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="text-sm text-destructive">{error}</div>
                  )}

                  <div className="flex gap-4">
                    <Button type="submit" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/')}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>{formData.title || 'Untitled'}</CardTitle>
                <CardDescription>
                  <div className="flex gap-2 mt-2">
                    <Badge>{formData.language}</Badge>
                    <Badge variant="outline">{formData.category}</Badge>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {formData.content ? (
                  <CodeSnippet
                    code={formData.content}
                    language={formData.language || 'plaintext'}
                  />
                ) : (
                  <p className="text-muted-foreground">No content to preview</p>
                )}
                {formData.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
    </AppLayout>
  );
}