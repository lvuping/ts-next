'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileCode } from 'lucide-react';
import { NoteTemplate } from '@/types/note';
import { CodeSnippet } from '@/components/notes/code-snippet';

interface TemplateCardProps {
  template: NoteTemplate;
}

export function TemplateCard({ template }: TemplateCardProps) {
  const router = useRouter();

  const handleUseTemplate = async () => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `New ${template.name}`,
          content: template.content,
          language: template.language,
          category: template.category,
          tags: ['template', template.name.toLowerCase().replace(/\s+/g, '-')],
          favorite: false,
          template: template.id,
        }),
      });

      if (response.ok) {
        const note = await response.json();
        router.push(`/notes/edit/${note.id}`);
      }
    } catch (error) {
      console.error('Failed to create note from template:', error);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="flex items-center gap-2">
              <FileCode className="h-5 w-5" />
              {template.name}
            </CardTitle>
            <CardDescription>{template.description}</CardDescription>
          </div>
          <Button
            size="sm"
            onClick={handleUseTemplate}
            className="ml-2"
          >
            Use Template
          </Button>
        </div>
        <div className="flex gap-2 mt-2">
          <Badge>{template.language}</Badge>
          <Badge variant="outline">{template.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden">
          <CodeSnippet
            code={template.content}
            language={template.language}
            className="max-h-64 overflow-y-auto"
          />
        </div>
      </CardContent>
    </Card>
  );
}