'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Wand2 } from 'lucide-react';
import { NoteInput } from '@/types/note';
import { CodeDiffViewer } from '@/components/notes/code-diff-viewer';
import { AppLayout } from '@/components/layout/app-layout';

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'csharp', 'cpp', 'go', 'rust',
  'php', 'ruby', 'swift', 'kotlin', 'sql', 'html', 'css', 'scss', 'json',
  'yaml', 'xml', 'markdown', 'bash', 'shell', 'plaintext'
];

export default function NewNotePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [assistPrompt, setAssistPrompt] = useState('');
  const [assistLoading, setAssistLoading] = useState(false);
  const [showDiffViewer, setShowDiffViewer] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [formData, setFormData] = useState<Partial<NoteInput>>({
    title: '',
    content: '',
    language: 'javascript',
    category: 'Other',
    tags: [],
    favorite: false,
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create note');
      }

      const note = await response.json();
      router.push(`/notes/edit/${note.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
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

  useEffect(() => {
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
    
    fetchMetadata();
  }, []);

  return (
    <AppLayout categories={categories} tags={tags}>
      <div className="min-h-screen bg-background">
        <header className="border-b p-4 md:p-6">
          <h1 className="text-2xl font-bold">Create New Note</h1>
        </header>

        <main className="container max-w-4xl mx-auto p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Note Details</CardTitle>
            <CardDescription>
              Create a new code snippet or technical note
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
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <SelectItem value="Frontend">Frontend</SelectItem>
                      <SelectItem value="Backend">Backend</SelectItem>
                      <SelectItem value="Database">Database</SelectItem>
                      <SelectItem value="DevOps">DevOps</SelectItem>
                      <SelectItem value="Security">Security</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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

              <div className="space-y-2">
                <Label htmlFor="content">Code Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Paste your code here..."
                  className="font-mono min-h-[300px]"
                  required
                />
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
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Note'}
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
        </main>
      </div>

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