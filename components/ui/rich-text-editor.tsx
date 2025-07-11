'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Bold,
  Italic,
  Code,
  Link,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Eye,
  Edit3,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
  required,
  minHeight = '400px',
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [activeTab, setActiveTab] = useState('edit');

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = 
      value.substring(0, start) + 
      before + 
      selectedText + 
      after + 
      value.substring(end);
    
    onChange(newText);
    
    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const formatActions = [
    { icon: Bold, label: 'Bold', action: () => insertMarkdown('**', '**') },
    { icon: Italic, label: 'Italic', action: () => insertMarkdown('*', '*') },
    { icon: Code, label: 'Code', action: () => insertMarkdown('`', '`') },
    { icon: Link, label: 'Link', action: () => insertMarkdown('[', '](url)') },
    { icon: List, label: 'Bullet List', action: () => insertMarkdown('- ', '') },
    { icon: ListOrdered, label: 'Numbered List', action: () => insertMarkdown('1. ', '') },
    { icon: Quote, label: 'Quote', action: () => insertMarkdown('> ', '') },
    { icon: Heading1, label: 'Heading 1', action: () => insertMarkdown('# ', '') },
    { icon: Heading2, label: 'Heading 2', action: () => insertMarkdown('## ', '') },
    { icon: Heading3, label: 'Heading 3', action: () => insertMarkdown('### ', '') },
  ];

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-2">
          <TabsList className="h-8">
            <TabsTrigger value="edit" className="text-xs h-7">
              <Edit3 className="h-3 w-3 mr-1" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-xs h-7">
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </TabsTrigger>
          </TabsList>
          
          {activeTab === 'edit' && (
            <div className="flex items-center gap-1">
              {formatActions.map((action, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={action.action}
                  title={action.label}
                >
                  <action.icon className="h-3 w-3" />
                </Button>
              ))}
            </div>
          )}
        </div>

        <TabsContent value="edit" className="mt-2">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="h-full w-full font-mono text-sm leading-relaxed resize-none border bg-transparent p-4 focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:outline-none placeholder:text-muted-foreground/40"
            style={{ minHeight }}
            required={required}
          />
        </TabsContent>

        <TabsContent value="preview" className="mt-2">
          <div 
            className="rounded-lg border p-4 prose prose-sm dark:prose-invert max-w-none"
            style={{ minHeight }}
          >
            {value ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {value}
              </ReactMarkdown>
            ) : (
              <p className="text-muted-foreground italic">Nothing to preview</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}