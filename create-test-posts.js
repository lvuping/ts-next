const testPosts = [
  {
    title: "Markdown Tutorial",
    content: `# Welcome to Markdown

This is a **comprehensive** markdown tutorial that shows various formatting options.

## Basic Formatting

- **Bold text** with double asterisks
- *Italic text* with single asterisks
- ***Bold and italic*** with triple asterisks
- \`Inline code\` with backticks

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

> This is a blockquote. It's useful for highlighting important information.
> 
> You can have multiple paragraphs in a blockquote.

## Code Blocks

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet('World');
\`\`\`

## Links and Images

[Visit GitHub](https://github.com)

![Placeholder](https://via.placeholder.com/150)

## Tables

| Feature | Markdown | Rich Text |
|---------|----------|-----------|
| Bold | **Yes** | Yes |
| Italic | *Yes* | Yes |
| Code | \`Yes\` | Limited |
`,
    contentFormat: "markdown",
    language: "markdown",
    category: "Other",
    tags: ["tutorial", "markdown", "documentation"],
    favorite: false
  },
  {
    title: "Rich Text Example",
    content: `<h1>Rich Text Formatting</h1>
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
<p>This is a blockquote in rich text format. It's styled differently than markdown.</p>
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
</ol>

<pre><code>// Code block in rich text
const message = "Hello from rich text!";
console.log(message);</code></pre>`,
    contentFormat: "rich",
    language: "html",
    category: "Frontend",
    tags: ["rich-text", "wysiwyg", "formatting"],
    favorite: true
  },
  {
    title: "React Component Example",
    content: `# React Button Component

A simple reusable button component with TypeScript support.

## Component Code

\`\`\`typescript
import React from 'react';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled,
  className,
  ...props
}) => {
  const baseClasses = 'font-semibold rounded transition-colors duration-200';
  
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600'
  };
  
  const sizeClasses = {
    small: 'px-3 py-1 text-sm',
    medium: 'px-4 py-2',
    large: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      className={\`\${baseClasses} \${variantClasses[variant]} \${sizeClasses[size]} \${className || ''}\`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};
\`\`\`

## Usage Example

\`\`\`tsx
<Button variant="primary" size="medium" onClick={handleClick}>
  Click Me
</Button>

<Button variant="danger" loading={isLoading}>
  Delete
</Button>
\`\`\`

## Props

- **variant**: Visual style of the button (primary, secondary, danger)
- **size**: Size of the button (small, medium, large)
- **loading**: Shows loading state and disables the button
- All standard HTML button attributes are supported`,
    contentFormat: "markdown",
    language: "typescript",
    category: "Frontend",
    tags: ["react", "typescript", "component", "ui"],
    favorite: true
  },
  {
    title: "API Documentation",
    content: `<h1>User API Documentation</h1>

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
}</code></pre>

<h3>2. Create User</h3>
<p><strong>POST</strong> <code>/users</code></p>

<h4>Request Body:</h4>
<pre><code>{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword"
}</code></pre>

<h4>Response:</h4>
<pre><code>{
  "id": "124",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "created_at": "2024-01-10T00:00:00Z"
}</code></pre>

<h3>Error Responses</h3>
<table border="1" style="border-collapse: collapse; width: 100%;">
<tr>
<th>Status Code</th>
<th>Description</th>
</tr>
<tr>
<td>400</td>
<td>Bad Request - Invalid input data</td>
</tr>
<tr>
<td>401</td>
<td>Unauthorized - Invalid or missing token</td>
</tr>
<tr>
<td>404</td>
<td>Not Found - Resource doesn't exist</td>
</tr>
<tr>
<td>500</td>
<td>Internal Server Error</td>
</tr>
</table>`,
    contentFormat: "rich",
    language: "markdown",
    category: "Backend",
    tags: ["api", "documentation", "rest", "backend"],
    favorite: false
  }
];

// Function to create posts
async function createTestPosts() {
  for (const post of testPosts) {
    try {
      const response = await fetch('http://localhost:3000/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(post)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Created post: ${data.title}`);
      } else {
        console.error(`Failed to create post: ${post.title}`, await response.text());
      }
    } catch (error) {
      console.error(`Error creating post: ${post.title}`, error);
    }
  }
}

// Run the function
createTestPosts();