'use client';

import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkWikiLink from 'remark-wiki-link';
import remarkDirective from 'remark-directive';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import mermaid from 'mermaid';
import { useTheme } from 'next-themes';
import { CodeSnippet } from './code-snippet';
import 'katex/dist/katex.min.css';
import '@/styles/markdown.css';

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

  // Preprocess content to clean up headings
  let processedContent = content
    // Remove markdown heading syntax that appears in the rendered text
    .replace(/^(#{1,6})\s+\1\s+(.*)$/gm, '$1 $2')
    // Fix double hash marks
    .replace(/^(#{1,6})\s+(.*?)(\s*\1)*$/gm, '$1 $2');
  
  // Process content to handle callouts/admonitions
  processedContent = processedContent.replace(
    /^> \[!(note|info|warning|error|success)\]\s*(.*)$/gm,
    (match, type: string, title: string) => {
      const icons: Record<string, string> = {
        note: '📝',
        info: 'ℹ️',
        warning: '⚠️',
        error: '❌',
        success: '✅'
      };
      const icon = icons[type] || '📝';
      
      return `<div class="callout callout-${type}">
<div class="callout-header">
<span class="callout-icon">${icon}</span>
<span class="callout-title">${title || type.charAt(0).toUpperCase() + type.slice(1)}</span>
</div>
<div class="callout-content">`;
    }
  ).replace(/^<\/div>\n<\/div>$/gm, '</div></div>');

  return (
    <div className={`markdown-renderer ${className || ''}`}>
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm,
          remarkMath,
          remarkDirective,
          [remarkWikiLink, {
            pageResolver: (name: string) => [name.replace(/ /g, '-').toLowerCase()],
            hrefTemplate: (permalink: string) => `#/page/${permalink}`
          }]
        ]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
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
              <code className={inline ? "inline-code" : className}>
                {children}
              </code>
            );
          },
          pre({ children }) {
            return <>{children}</>;
          },
          h1: ({ children }) => <h1>{children}</h1>,
          h2: ({ children }) => <h2>{children}</h2>,
          h3: ({ children }) => <h3>{children}</h3>,
          h4: ({ children }) => <h4>{children}</h4>,
          h5: ({ children }) => <h5>{children}</h5>,
          h6: ({ children }) => <h6>{children}</h6>,
          p: ({ children }) => <p>{children}</p>,
          ul: ({ children }) => {
            // Check if this is a task list
            const isTaskList = Array.isArray(children) && 
              children.some((child) => {
                if (!React.isValidElement(child)) return false;
                const props = child.props as { className?: string };
                return props.className === 'task-list-item';
              });
            
            return (
              <ul className={isTaskList ? "" : ""}>{children}</ul>
            );
          },
          ol: ({ children }) => <ol>{children}</ol>,
          li: ({ children, className }) => {
            // Handle task list items
            if (className === 'task-list-item') {
              return <li className="task-list-item">{children}</li>;
            }
            return <li>{children}</li>;
          },
          input: ({ type, checked, disabled }) => {
            if (type === 'checkbox') {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  className="task-list-checkbox"
                  readOnly
                />
              );
            }
            return null;
          },
          blockquote: ({ children }) => <blockquote>{children}</blockquote>,
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table>{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead>{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr>{children}</tr>,
          th: ({ children }) => <th>{children}</th>,
          td: ({ children }) => <td>{children}</td>,
          hr: () => <hr />,
          a: ({ href, children }) => {
            // Handle wiki links
            if (href?.startsWith('#/page/')) {
              return (
                <a
                  href={href}
                  className="wiki-link"
                  onClick={(e) => {
                    e.preventDefault();
                    // Handle internal navigation
                    console.log('Navigate to:', href);
                  }}
                >
                  {children}
                </a>
              );
            }
            
            return (
              <a
                href={href}
                className="text-primary hover:underline underline-offset-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            );
          },
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={alt || ''}
              className="rounded-lg shadow-md max-w-full h-auto my-4"
            />
          ),
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
          del: ({ children }) => (
            <del className="line-through text-muted-foreground">{children}</del>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}