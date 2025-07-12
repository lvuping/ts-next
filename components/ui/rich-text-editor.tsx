'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  FileText,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Underline,
  Strikethrough,
} from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  contentFormat?: 'markdown' | 'rich';
  onContentFormatChange?: (format: 'markdown' | 'rich') => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  contentFormat = 'markdown',
  onContentFormatChange,
  placeholder,
  className,
  required,
  minHeight = '400px',
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const richEditorRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('edit');
  const [editorMode, setEditorMode] = useState<'markdown' | 'rich'>(contentFormat);
  const [richContent, setRichContent] = useState('');

  // Convert between markdown and HTML
  const markdownToHtml = (markdown: string): string => {
    // Basic markdown to HTML conversion
    let html = markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Code
      .replace(/`(.+?)`/g, '<code>$1</code>')
      // Line breaks
      .replace(/\n/g, '<br>')
      // Lists
      .replace(/^\* (.+)$/gim, '<li>$1</li>')
      .replace(/^\d+\. (.+)$/gim, '<li>$1</li>')
      // Blockquote
      .replace(/^> (.+)$/gim, '<blockquote>$1</blockquote>');
    
    // Wrap consecutive list items
    html = html.replace(/(<li>.*<\/li>(\s*<br>)*)+/g, (match) => {
      const cleaned = match.replace(/<br>/g, '');
      return `<ul>${cleaned}</ul>`;
    });
    
    return html;
  };

  const htmlToMarkdown = (html: string): string => {
    // Create a temporary element to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    let markdown = '';
    
    const processNode = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || '';
      }
      
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tagName = el.tagName.toLowerCase();
        const content = Array.from(el.childNodes).map(processNode).join('');
        
        switch (tagName) {
          case 'h1':
            return `# ${content}\n\n`;
          case 'h2':
            return `## ${content}\n\n`;
          case 'h3':
            return `### ${content}\n\n`;
          case 'strong':
          case 'b':
            return `**${content}**`;
          case 'em':
          case 'i':
            return `*${content}*`;
          case 'code':
            return `\`${content}\``;
          case 'blockquote':
            return `> ${content}\n`;
          case 'ul':
          case 'ol':
            return content + '\n';
          case 'li':
            const parent = el.parentElement;
            if (parent?.tagName.toLowerCase() === 'ol') {
              const index = Array.from(parent.children).indexOf(el) + 1;
              return `${index}. ${content}\n`;
            }
            return `* ${content}\n`;
          case 'br':
            return '\n';
          case 'p':
            return `${content}\n\n`;
          case 'div':
            return `${content}\n`;
          default:
            return content;
        }
      }
      
      return '';
    };
    
    markdown = Array.from(temp.childNodes).map(processNode).join('');
    
    // Clean up extra line breaks
    return markdown.replace(/\n{3,}/g, '\n\n').trim();
  };

  useEffect(() => {
    if (editorMode === 'rich' && contentFormat === 'markdown') {
      setRichContent(markdownToHtml(value));
    } else if (editorMode === 'rich') {
      setRichContent(value);
    }
  }, [value, editorMode, contentFormat]);

  const handleModeChange = (newMode: 'markdown' | 'rich') => {
    if (newMode === editorMode) return;
    
    if (newMode === 'rich') {
      // Converting to rich mode
      if (contentFormat === 'markdown') {
        setRichContent(markdownToHtml(value));
      } else {
        setRichContent(value);
      }
    } else {
      // Converting to markdown mode
      if (contentFormat === 'rich' && richEditorRef.current) {
        const markdown = htmlToMarkdown(richEditorRef.current.innerHTML);
        onChange(markdown);
      }
    }
    
    setEditorMode(newMode);
    onContentFormatChange?.(newMode);
  };

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

  const execCommand = (command: string, value?: string) => {
    if (richEditorRef.current) {
      richEditorRef.current.focus();
      document.execCommand(command, false, value);
      handleRichContentChange();
    }
  };

  const handleRichContentChange = () => {
    if (richEditorRef.current) {
      const html = richEditorRef.current.innerHTML;
      setRichContent(html);
      
      if (contentFormat === 'markdown') {
        const markdown = htmlToMarkdown(html);
        onChange(markdown);
      } else {
        onChange(html);
      }
    }
  };

  const formatActions = editorMode === 'markdown' ? [
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
  ] : [
    { icon: Bold, label: 'Bold', action: () => execCommand('bold') },
    { icon: Italic, label: 'Italic', action: () => execCommand('italic') },
    { icon: Underline, label: 'Underline', action: () => execCommand('underline') },
    { icon: Strikethrough, label: 'Strikethrough', action: () => execCommand('strikeThrough') },
    { icon: Code, label: 'Code', action: () => execCommand('formatBlock', '<pre>') },
    { icon: Link, label: 'Link', action: () => {
      const url = prompt('Enter URL:');
      if (url) execCommand('createLink', url);
    }},
    { icon: List, label: 'Bullet List', action: () => execCommand('insertUnorderedList') },
    { icon: ListOrdered, label: 'Numbered List', action: () => execCommand('insertOrderedList') },
    { icon: Quote, label: 'Quote', action: () => execCommand('formatBlock', '<blockquote>') },
    { icon: Heading1, label: 'Heading 1', action: () => execCommand('formatBlock', '<h1>') },
    { icon: Heading2, label: 'Heading 2', action: () => execCommand('formatBlock', '<h2>') },
    { icon: Heading3, label: 'Heading 3', action: () => execCommand('formatBlock', '<h3>') },
    { icon: AlignLeft, label: 'Align Left', action: () => execCommand('justifyLeft') },
    { icon: AlignCenter, label: 'Align Center', action: () => execCommand('justifyCenter') },
    { icon: AlignRight, label: 'Align Right', action: () => execCommand('justifyRight') },
  ];

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Toggle
            pressed={editorMode === 'markdown'}
            onPressedChange={() => handleModeChange('markdown')}
            className="h-8"
          >
            <FileText className="h-3 w-3 mr-1" />
            Markdown
          </Toggle>
          <Toggle
            pressed={editorMode === 'rich'}
            onPressedChange={() => handleModeChange('rich')}
            className="h-8"
          >
            <AlignLeft className="h-3 w-3 mr-1" />
            Normal
          </Toggle>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
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
        </Tabs>
      </div>

      {activeTab === 'edit' && (
        <div className="flex items-center gap-1 mb-2 flex-wrap">
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

      {activeTab === 'edit' ? (
        editorMode === 'markdown' ? (
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="h-full w-full font-mono text-sm leading-relaxed resize-none border bg-transparent p-4 focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:outline-none placeholder:text-muted-foreground/40"
            style={{ minHeight }}
            required={required}
          />
        ) : (
          <div
            ref={richEditorRef}
            contentEditable
            className="h-full w-full text-sm leading-relaxed resize-none border rounded-md bg-transparent p-4 focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:outline-none prose prose-sm dark:prose-invert max-w-none"
            style={{ minHeight }}
            dangerouslySetInnerHTML={{ __html: richContent }}
            onInput={handleRichContentChange}
            onBlur={handleRichContentChange}
            data-placeholder={placeholder}
          />
        )
      ) : (
        <div 
          className="rounded-lg border p-4 prose prose-sm dark:prose-invert max-w-none"
          style={{ minHeight }}
        >
          {value ? (
            contentFormat === 'markdown' || editorMode === 'markdown' ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {value}
              </ReactMarkdown>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: value }} />
            )
          ) : (
            <p className="text-muted-foreground italic">Nothing to preview</p>
          )}
        </div>
      )}
    </div>
  );
}