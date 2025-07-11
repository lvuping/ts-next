'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Wand2 } from 'lucide-react';
import { NoteInput } from '@/types/note';
import { CodeDiffViewer } from '@/components/notes/code-diff-viewer';
import { AppLayout } from '@/components/layout/app-layout';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const LANGUAGES = [
  'plaintext', 'abap', 'javascript', 'typescript', 'python', 'java', 'csharp', 'cpp', 
  'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'sql', 'html', 'css', 'scss', 
  'json', 'yaml', 'xml', 'markdown', 'bash', 'shell'
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
  const [showAutoFillDialog, setShowAutoFillDialog] = useState(false);
  const [suggestedLanguage, setSuggestedLanguage] = useState('');
  const [suggestedCategory, setSuggestedCategory] = useState('');
  const [formData, setFormData] = useState<Partial<NoteInput>>({
    title: '',
    content: '',
    language: '',
    category: '',
    tags: [],
    favorite: false,
  });
  const [categories, setCategories] = useState<Array<{ id: number; name: string; color: string; icon: string; position: number }>>([]);
  const [tags, setTags] = useState<string[]>([]);

  const detectLanguageAndCategory = () => {
    const combinedText = `${formData.title} ${formData.content}`.toLowerCase();
    
    // Language detection based on content and title
    let detectedLanguage = 'plaintext';
    const languageKeywords: Record<string, string[]> = {
      abap: ['abap', 'data:', 'types:', 'loop at', 'endloop', 'if', 'endif', 'select', 'endselect', 'move', 'write', 'report'],
      javascript: ['javascript', 'js', 'node', 'npm', 'react', 'vue', 'angular', 'const', 'let', 'var', 'function', 'console.log'],
      typescript: ['typescript', 'ts', 'interface', 'type', 'enum', 'implements', 'extends'],
      python: ['python', 'py', 'def', 'import', 'from', 'class', 'self', 'print('],
      java: ['java', 'public class', 'private', 'protected', 'static void', 'new ', 'System.out'],
      csharp: ['c#', 'csharp', 'using System', 'namespace', 'public class', 'private', 'protected'],
      cpp: ['c++', 'cpp', '#include', 'std::', 'cout', 'cin', 'vector<', 'nullptr'],
      go: ['golang', 'go', 'package main', 'func', 'import (', 'fmt.'],
      rust: ['rust', 'fn ', 'let mut', 'impl', 'trait', 'struct', 'enum', 'cargo'],
      php: ['php', '<?php', '$', 'echo', 'function', 'class', 'namespace'],
      ruby: ['ruby', 'rb', 'def', 'end', 'class', 'module', 'puts', 'require'],
      swift: ['swift', 'var', 'let', 'func', 'class', 'struct', 'enum', 'import'],
      kotlin: ['kotlin', 'fun', 'val', 'var', 'class', 'object', 'companion'],
      sql: ['sql', 'select', 'from', 'where', 'insert', 'update', 'delete', 'create table', 'join'],
      html: ['html', '<div', '<p>', '<h1', '<body', '<head', '<!DOCTYPE', '<meta'],
      css: ['css', 'style', '{', '}', 'color:', 'background:', 'display:', 'position:'],
      json: ['json', '{', '}', ':', '"', '[', ']'],
      yaml: ['yaml', 'yml', ':', '-', 'version:', 'services:', 'image:'],
      xml: ['xml', '<?xml', '<', '>', '/>', 'version="', 'encoding='],
      markdown: ['markdown', 'md', '#', '##', '###', '```', '**', '*', '[', ']', '!['],
      bash: ['bash', 'sh', '#!/bin/bash', 'echo', 'if [', 'then', 'fi', 'for', 'do'],
      shell: ['shell', '#!/bin/sh', 'echo', 'export', 'source', 'alias'],
    };

    for (const [lang, keywords] of Object.entries(languageKeywords)) {
      if (keywords.some(keyword => combinedText.includes(keyword))) {
        detectedLanguage = lang;
        break;
      }
    }

    // Category detection based on content and title
    let detectedCategory = 'Other';
    const categoryKeywords: Record<string, string[]> = {
      Algorithm: ['algorithm', 'sort', 'search', 'binary', 'tree', 'graph', 'dynamic programming', 'recursion'],
      Tutorial: ['tutorial', 'guide', 'how to', 'learn', 'example', 'step by step', 'beginner'],
      Debug: ['debug', 'error', 'fix', 'issue', 'problem', 'bug', 'troubleshoot', 'solve'],
      Feature: ['feature', 'implement', 'add', 'new', 'functionality', 'enhancement', 'improve'],
      Config: ['config', 'configuration', 'setup', 'settings', 'environment', 'env', 'yml', 'json'],
      Test: ['test', 'testing', 'unit test', 'integration', 'jest', 'mocha', 'pytest', 'assert'],
      Documentation: ['documentation', 'docs', 'readme', 'api', 'reference', 'guide', 'manual'],
      Refactor: ['refactor', 'clean', 'optimize', 'improve', 'restructure', 'reorganize'],
      Security: ['security', 'auth', 'authentication', 'encryption', 'token', 'password', 'secure'],
      Performance: ['performance', 'optimize', 'speed', 'fast', 'slow', 'memory', 'cpu', 'benchmark'],
    };

    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      const categoryExists = categories.some(c => c.name === cat);
      if (categoryExists && keywords.some(keyword => combinedText.includes(keyword))) {
        detectedCategory = cat;
        break;
      }
    }

    return { language: detectedLanguage, category: detectedCategory };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check if language or category is empty
    if (!formData.language || !formData.category) {
      const { language, category } = detectLanguageAndCategory();
      setSuggestedLanguage(language);
      setSuggestedCategory(category);
      setShowAutoFillDialog(true);
      return;
    }

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

  const handleAutoFillConfirm = () => {
    setFormData({
      ...formData,
      language: suggestedLanguage || 'plaintext',
      category: suggestedCategory || 'Other',
    });
    setShowAutoFillDialog(false);
    // Retry submission with filled values
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        form.requestSubmit();
      }
    }, 100);
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
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b px-6 py-4 flex-shrink-0">
          <h1 className="text-2xl font-bold">Create New Note</h1>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-5xl mx-auto w-full">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Note title"
                  className="text-lg font-medium border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
                  required
                  autoFocus
                />
              </div>

              <div className="bg-accent/30 rounded-lg p-3">
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
                    placeholder="Ask AI to help write or modify code..."
                    className="bg-background/60 border-0 placeholder:text-muted-foreground/60"
                    disabled={assistLoading}
                  />
                  <Button
                    type="button"
                    onClick={handleAssist}
                    disabled={assistLoading || !assistPrompt.trim()}
                    size="sm"
                    className="px-4"
                  >
                    <Wand2 className="h-4 w-4" />
                    {assistLoading ? '' : ''}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Select
                  value={formData.language}
                  onValueChange={(value) => setFormData({ ...formData, language: value })}
                >
                  <SelectTrigger id="language" className="w-[140px] h-9">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category" className="w-[140px] h-9">
                    <SelectValue placeholder="Category" />
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

              <div className="flex-1">
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Start writing your code or notes..."
                  className="font-mono min-h-[400px] resize-none border-0 bg-accent/10 focus-visible:ring-1 focus-visible:ring-primary/20"
                  required
                />
              </div>

              <div>
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Add tags (press Enter)"
                  className="h-9"
                />
                {formData.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
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

              <div className="flex gap-3 pt-4 border-t">
                <Button type="submit" disabled={loading} size="sm">
                  {loading ? 'Creating...' : 'Create Note'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/')}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </form>
        </div>
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

      <Dialog open={showAutoFillDialog} onOpenChange={setShowAutoFillDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Auto-fill Language and Category</DialogTitle>
            <DialogDescription>
              Based on your title and content, we suggest the following:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">Language:</span>
              <Badge variant="secondary">{suggestedLanguage}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Category:</span>
              <Badge variant="secondary">{suggestedCategory}</Badge>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAutoFillDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAutoFillConfirm}>
              Accept and Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}