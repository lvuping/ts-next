import { NoteTemplate } from '@/types/note';

export const noteTemplates: NoteTemplate[] = [
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

export async function getTemplates(): Promise<NoteTemplate[]> {
  // In the future, this could fetch from a database or API
  return noteTemplates;
}