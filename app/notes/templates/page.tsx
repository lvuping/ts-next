'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileCode } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { NoteTemplate } from '@/types/note';
import { CodeSnippet } from '@/components/notes/code-snippet';
import { AppLayout } from '@/components/layout/app-layout';

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<NoteTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Array<{ id: number; name: string; color: string; icon: string; position: number }>>([]);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/notes/metadata');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
        setTags(data.tags);
        // Get templates from the initial data
        const templatesData: NoteTemplate[] = [
          {
            id: 'react-component',
            name: 'React Component',
            description: 'Basic React functional component with TypeScript',
            language: 'typescript',
            content: `import React from 'react';

interface Props {
  // Define your props here
}

export default function ComponentName({ }: Props) {
  return (
    <div>
      {/* Your component content */}
    </div>
  );
}`,
            category: 'Frontend'
          },
          {
            id: 'express-route',
            name: 'Express Route',
            description: 'Basic Express.js route handler',
            language: 'javascript',
            content: `router.get('/path', async (req, res) => {
  try {
    // Your route logic here
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});`,
            category: 'Backend'
          },
          {
            id: 'sql-query',
            name: 'SQL Query',
            description: 'Basic SQL query template',
            language: 'sql',
            content: `SELECT 
  column1,
  column2,
  COUNT(*) as count
FROM table_name
WHERE condition = true
GROUP BY column1, column2
ORDER BY count DESC
LIMIT 10;`,
            category: 'Database'
          },
          {
            id: 'python-class',
            name: 'Python Class',
            description: 'Basic Python class with constructor',
            language: 'python',
            content: `class ClassName:
    def __init__(self, param1, param2):
        self.param1 = param1
        self.param2 = param2
    
    def method_name(self):
        """Method description"""
        pass`,
            category: 'Backend'
          },
          {
            id: 'docker-compose',
            name: 'Docker Compose',
            description: 'Basic Docker Compose configuration',
            language: 'yaml',
            content: `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./app:/app
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: mydb
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:`,
            category: 'DevOps'
          },
          {
            id: 'github-action',
            name: 'GitHub Action',
            description: 'Basic GitHub Actions workflow',
            language: 'yaml',
            content: `name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Build
      run: npm run build`,
            category: 'DevOps'
          }
        ];
        setTemplates(templatesData);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = async (template: NoteTemplate) => {
    // Create a new note with template content
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
    <AppLayout categories={categories} tags={tags}>
      <div className="h-full flex flex-col">
        <AppHeader title="Code Templates" />

        <main className="flex-1 overflow-y-auto px-6 py-4">
          <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading templates...</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow overflow-hidden">
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
                        onClick={() => handleUseTemplate(template)}
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
              ))}
            </div>
          )}
          </div>
        </main>
      </div>
    </AppLayout>
  );
}