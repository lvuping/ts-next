'use client';

import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import { useTheme } from 'next-themes';
import { CodeSnippet } from './code-snippet';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const { theme } = useTheme();
  const [isInitialized, setIsInitialized] = useState(false);
  const mermaidCounter = useRef(0);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: theme === 'dark' ? 'dark' : 'default',
      securityLevel: 'loose',
    });
    setIsInitialized(true);
  }, [theme]);

  useEffect(() => {
    if (isInitialized) {
      mermaid.run();
    }
  }, [content, isInitialized]);

  return (
    <div className={`prose prose-sm max-w-none dark:prose-invert ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        code(props) {
          const { className, children } = props as { className?: string; children?: React.ReactNode };
          const inline = (props as { inline?: boolean }).inline;
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : '';
          
          if (!inline && language === 'mermaid') {
            const graphId = `mermaid-${mermaidCounter.current++}`;
            return (
              <div className="my-4">
                <pre className="mermaid" id={graphId}>
                  {String(children).replace(/\n$/, '')}
                </pre>
              </div>
            );
          }

          if (!inline && language) {
            return (
              <div className="my-4">
                <CodeSnippet
                  code={String(children).replace(/\n$/, '')}
                  language={language}
                  className="not-prose"
                />
              </div>
            );
          }

          return (
            <code className={className}>
              {children}
            </code>
          );
        },
        pre({ children }) {
          return <>{children}</>;
        },
        h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>,
        h2: ({ children }) => <h2 className="text-xl font-semibold mt-5 mb-3">{children}</h2>,
        h3: ({ children }) => <h3 className="text-lg font-medium mt-4 mb-2">{children}</h3>,
        p: ({ children }) => <p className="mb-4">{children}</p>,
        ul: ({ children }) => <ul className="list-disc pl-6 mb-4">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-6 mb-4">{children}</ol>,
        li: ({ children }) => <li className="mb-1">{children}</li>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-muted-foreground/30 pl-4 italic my-4">
            {children}
          </blockquote>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-4">
            <table className="min-w-full border-collapse">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="border-b-2 border-muted">{children}</thead>,
        tbody: ({ children }) => <tbody>{children}</tbody>,
        tr: ({ children }) => <tr className="border-b border-muted">{children}</tr>,
        th: ({ children }) => <th className="px-4 py-2 text-left font-semibold">{children}</th>,
        td: ({ children }) => <td className="px-4 py-2">{children}</td>,
        hr: () => <hr className="my-8 border-muted" />,
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  );
}