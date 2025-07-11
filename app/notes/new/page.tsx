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

        <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto h-full flex flex-col">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              {/* Title Section */}
              <div className="px-8 pt-6 pb-3">
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Untitled Note"
                  className="text-2xl font-semibold bg-transparent border-0 px-0 focus-visible:ring-0 placeholder:text-muted-foreground/50"
                  required
                  autoFocus
                />
              </div>

              {/* Metadata and AI Assist Bar */}
              <div className="px-8 pb-4 space-y-3">
                {/* Language and Category Selectors */}
                <div className="flex gap-3 items-center">
                  <div className="flex items-center gap-2">
                    <label htmlFor="language" className="text-sm text-muted-foreground">Language:</label>
                    <Select
                      value={formData.language}
                      onValueChange={(value) => setFormData({ ...formData, language: value })}
                    >
                      <SelectTrigger id="language" className="w-[180px] h-8 text-sm">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang} value={lang} className="text-sm">
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <label htmlFor="category" className="text-sm text-muted-foreground">Category:</label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger id="category" className="w-[180px] h-8 text-sm">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name} className="text-sm">
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* AI Assist Bar */}
                <div className="bg-accent/20 rounded-lg p-3 border border-accent/30">
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
              <div className="flex-1 px-8 pb-6">
                <div className="h-full rounded-lg border bg-background/50">
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Start writing your code or notes..."
                    className="h-full font-mono text-sm resize-none border-0 bg-transparent p-4 focus-visible:ring-0"
                    required
                  />
                </div>
              </div>

              {/* Tags and Actions Section */}
              <div className="px-8 pb-6 space-y-4 border-t bg-background/50">
                {/* Tags */}
                <div className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium text-muted-foreground">Tags</label>
                    {formData.tags && formData.tags.length > 0 && (
                      <span className="text-xs text-muted-foreground">({formData.tags.length})</span>
                    )}
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
                  <Button type="submit" disabled={loading} className="px-6">
                    {loading ? 'Creating...' : 'Create Note'}
                  </Button>
                </div>
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