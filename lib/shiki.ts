import { createHighlighter, bundledLanguages } from 'shiki';

import { Highlighter } from 'shiki';

let highlighterPromise: Promise<Highlighter> | null = null;

// Pre-initialize the highlighter to reduce delay on first use
if (typeof window !== 'undefined') {
  highlighterPromise = createHighlighter({
    themes: ['github-dark', 'github-light'],
    langs: Object.keys(bundledLanguages),
  });
}

export async function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-dark', 'github-light'],
      langs: Object.keys(bundledLanguages),
    });
  }
  return highlighterPromise;
}

export async function highlightCode(code: string, language: string, theme: 'dark' | 'light' = 'dark') {
  try {
    const highlighter = await getHighlighter();
    const themeKey = theme === 'dark' ? 'github-dark' : 'github-light';
    
    return highlighter.codeToHtml(code, {
      lang: language,
      theme: themeKey,
    });
  } catch (error) {
    console.error('Highlighting error:', error);
    // Fallback to plain text
    return `<pre><code>${escapeHtml(code)}</code></pre>`;
  }
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}