-- Insert test posts directly into the database

-- Post 1: Markdown Tutorial
INSERT INTO notes (id, title, content, content_format, language, category, favorite, created_at, updated_at)
VALUES (
  '1757896800000-test1',
  'Markdown Tutorial',
  '# Welcome to Markdown

This is a **comprehensive** markdown tutorial that shows various formatting options.

## Basic Formatting

- **Bold text** with double asterisks
- *Italic text* with single asterisks
- ***Bold and italic*** with triple asterisks
- `Inline code` with backticks

## Lists

### Unordered List
- First item
- Second item
  - Nested item
  - Another nested item
- Third item

### Ordered List
1. First step
2. Second step
3. Third step

## Blockquotes

> This is a blockquote. It''s useful for highlighting important information.
> 
> You can have multiple paragraphs in a blockquote.

## Code Blocks

```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
}

greet(''World'');
```',
  'markdown',
  'markdown',
  'Other',
  0,
  datetime('now'),
  datetime('now')
);

-- Post 2: Rich Text Example
INSERT INTO notes (id, title, content, content_format, language, category, favorite, created_at, updated_at)
VALUES (
  '1757896800001-test2',
  'Rich Text Example',
  '<h1>Rich Text Formatting</h1>
<p>This post demonstrates <strong>rich text</strong> formatting with various <em>styles</em> and <u>decorations</u>.</p>

<h2>Text Styles</h2>
<ul>
<li><strong>Bold text</strong> for emphasis</li>
<li><em>Italic text</em> for subtle emphasis</li>
<li><u>Underlined text</u> for highlights</li>
<li><s>Strikethrough text</s> for corrections</li>
</ul>

<h2>Alignment Options</h2>
<p style="text-align: left;">Left aligned text (default)</p>
<p style="text-align: center;">Center aligned text</p>
<p style="text-align: right;">Right aligned text</p>

<blockquote>
<p>This is a blockquote in rich text format. It''s styled differently than markdown.</p>
</blockquote>

<h2>Nested Lists</h2>
<ol>
<li>First main point
  <ul>
    <li>Sub-point A</li>
    <li>Sub-point B</li>
  </ul>
</li>
<li>Second main point</li>
<li>Third main point</li>
</ol>',
  'rich',
  'html',
  'Frontend',
  1,
  datetime('now'),
  datetime('now')
);

-- Post 3: React Component
INSERT INTO notes (id, title, content, content_format, language, category, favorite, created_at, updated_at)
VALUES (
  '1757896800002-test3',
  'React Button Component',
  '# React Button Component

A simple reusable button component with TypeScript support.

## Component Code

```typescript
import React from ''react'';
import { ButtonHTMLAttributes } from ''react'';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ''primary'' | ''secondary'' | ''danger'';
  size?: ''small'' | ''medium'' | ''large'';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = ''primary'',
  size = ''medium'',
  loading = false,
  disabled,
  className,
  ...props
}) => {
  const baseClasses = ''font-semibold rounded transition-colors duration-200'';
  
  const variantClasses = {
    primary: ''bg-blue-500 text-white hover:bg-blue-600'',
    secondary: ''bg-gray-200 text-gray-800 hover:bg-gray-300'',
    danger: ''bg-red-500 text-white hover:bg-red-600''
  };
  
  const sizeClasses = {
    small: ''px-3 py-1 text-sm'',
    medium: ''px-4 py-2'',
    large: ''px-6 py-3 text-lg''
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className || ''''}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? ''Loading...'' : children}
    </button>
  );
};
```

## Usage Example

```tsx
<Button variant="primary" size="medium" onClick={handleClick}>
  Click Me
</Button>

<Button variant="danger" loading={isLoading}>
  Delete
</Button>
```',
  'markdown',
  'typescript',
  'Frontend',
  1,
  datetime('now'),
  datetime('now')
);

-- Post 4: API Documentation (Rich Text)
INSERT INTO notes (id, title, content, content_format, language, category, favorite, created_at, updated_at)
VALUES (
  '1757896800003-test4',
  'User API Documentation',
  '<h1>User API Documentation</h1>

<p>This document describes the RESTful API endpoints for user management.</p>

<h2>Base URL</h2>
<pre><code>https://api.example.com/v1</code></pre>

<h2>Authentication</h2>
<p>All API requests require authentication using a Bearer token in the Authorization header:</p>
<pre><code>Authorization: Bearer YOUR_TOKEN_HERE</code></pre>

<h2>Endpoints</h2>

<h3>1. Get All Users</h3>
<p><strong>GET</strong> <code>/users</code></p>

<h4>Query Parameters:</h4>
<ul>
<li><code>page</code> (optional): Page number for pagination (default: 1)</li>
<li><code>limit</code> (optional): Number of results per page (default: 20)</li>
<li><code>sort</code> (optional): Sort field (name, email, created_at)</li>
</ul>

<h4>Response:</h4>
<pre><code>{
  "data": [
    {
      "id": "123",
      "name": "John Doe",
      "email": "john@example.com",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}</code></pre>',
  'rich',
  'markdown',
  'Backend',
  0,
  datetime('now'),
  datetime('now')
);

-- Add tags for the posts
INSERT INTO tags (name) VALUES 
('tutorial'), ('markdown'), ('documentation'), ('rich-text'), 
('wysiwyg'), ('formatting'), ('react'), ('typescript'), 
('component'), ('ui'), ('api'), ('rest'), ('backend');

-- Link tags to posts
-- Post 1 tags
INSERT INTO note_tags (note_id, tag_id) 
SELECT '1757896800000-test1', id FROM tags WHERE name IN ('tutorial', 'markdown', 'documentation');

-- Post 2 tags
INSERT INTO note_tags (note_id, tag_id) 
SELECT '1757896800001-test2', id FROM tags WHERE name IN ('rich-text', 'wysiwyg', 'formatting');

-- Post 3 tags
INSERT INTO note_tags (note_id, tag_id) 
SELECT '1757896800002-test3', id FROM tags WHERE name IN ('react', 'typescript', 'component', 'ui');

-- Post 4 tags
INSERT INTO note_tags (note_id, tag_id) 
SELECT '1757896800003-test4', id FROM tags WHERE name IN ('api', 'documentation', 'rest', 'backend');