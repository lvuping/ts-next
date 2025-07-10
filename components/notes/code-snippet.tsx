'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { highlightCode } from '@/lib/shiki';
import { useTheme } from 'next-themes';

interface CodeSnippetProps {
  code: string;
  language: string;
  className?: string;
}

export function CodeSnippet({ code, language, className }: CodeSnippetProps) {
  const [html, setHtml] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    setIsLoading(true);
    highlightCode(code, language, theme as 'dark' | 'light').then((highlighted) => {
      setHtml(highlighted);
      setIsLoading(false);
    });
  }, [code, language, theme]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className={`relative group ${className}`}>
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="sm"
          variant="secondary"
          onClick={handleCopy}
          className="h-8 px-2"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>
      {isLoading || !html ? (
        <pre className="p-4 rounded-md bg-muted overflow-x-auto">
          <code className="text-sm">{code}</code>
        </pre>
      ) : (
        <div 
          dangerouslySetInnerHTML={{ __html: html }} 
          className="w-full overflow-auto"
        />
      )}
    </div>
  );
}