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

  // Process content to handle callouts/admonitions
  const processedContent = content.replace(
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
    <div className={`prose prose-sm max-w-none dark:prose-invert ${className}`}>
      <style jsx global>{`
        .callout {
          margin: 1rem 0;
          padding: 1rem;
          border-radius: 0.5rem;
          border-left: 4px solid;
        }
        
        .callout-note {
          background-color: rgba(59, 130, 246, 0.1);
          border-color: rgb(59, 130, 246);
        }
        
        .callout-info {
          background-color: rgba(14, 165, 233, 0.1);
          border-color: rgb(14, 165, 233);
        }
        
        .callout-warning {
          background-color: rgba(251, 191, 36, 0.1);
          border-color: rgb(251, 191, 36);
        }
        
        .callout-error {
          background-color: rgba(239, 68, 68, 0.1);
          border-color: rgb(239, 68, 68);
        }
        
        .callout-success {
          background-color: rgba(34, 197, 94, 0.1);
          border-color: rgb(34, 197, 94);
        }
        
        .callout-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .callout-icon {
          font-size: 1.25rem;
        }
        
        .callout-content {
          padding-left: 2rem;
        }
        
        .task-list-item {
          list-style: none;
          position: relative;
          padding-left: 1.5rem;
        }
        
        .task-list-item input[type="checkbox"] {
          position: absolute;
          left: 0;
          top: 0.25rem;
          cursor: pointer;
        }
        
        .wiki-link {
          color: rgb(139, 92, 246);
          text-decoration: none;
          border-bottom: 1px dashed rgb(139, 92, 246);
        }
        
        .wiki-link:hover {
          border-bottom-style: solid;
        }
        
        .inline-code {
          background-color: rgba(107, 114, 128, 0.1);
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, Courier, monospace;
        }
        
        .dark .inline-code {
          background-color: rgba(156, 163, 175, 0.2);
        }
      `}</style>
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
          h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-semibold mt-5 mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-medium mt-4 mb-2">{children}</h3>,
          h4: ({ children }) => <h4 className="text-base font-medium mt-3 mb-2">{children}</h4>,
          h5: ({ children }) => <h5 className="text-sm font-medium mt-2 mb-1">{children}</h5>,
          h6: ({ children }) => <h6 className="text-sm font-medium mt-2 mb-1">{children}</h6>,
          p: ({ children }) => <p className="mb-4 leading-7">{children}</p>,
          ul: ({ children }) => {
            // Check if this is a task list
            const isTaskList = Array.isArray(children) && 
              children.some((child) => {
                if (!React.isValidElement(child)) return false;
                const props = child.props as { className?: string };
                return props.className === 'task-list-item';
              });
            
            return (
              <ul className={isTaskList ? "list-none pl-0 mb-4" : "list-disc pl-6 mb-4 space-y-1"}>
                {children}
              </ul>
            );
          },
          ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
          li: ({ children, className }) => {
            // Handle task list items
            if (className === 'task-list-item') {
              return <li className="task-list-item mb-1">{children}</li>;
            }
            return <li className="mb-1">{children}</li>;
          },
          input: ({ type, checked, disabled }) => {
            if (type === 'checkbox') {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  className="mr-2"
                  onChange={(e) => e.preventDefault()}
                />
              );
            }
            return null;
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-muted-foreground/30 pl-4 italic my-4 text-muted-foreground">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full border-collapse border border-muted">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/50">
              {children}
            </thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b border-muted hover:bg-muted/20 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-left font-semibold text-sm border-r border-muted last:border-r-0">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-sm border-r border-muted last:border-r-0">
              {children}
            </td>
          ),
          hr: () => <hr className="my-8 border-muted" />,
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