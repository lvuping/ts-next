'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { useEffect, useState } from 'react';

export function ViewWrapper({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Array<{ id: number; name: string; color: string; icon: string; position: number }>>([]);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await fetch('/api/notes/metadata');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories);
          setTags(data.tags);
        }
      } catch (error) {
        console.error('Failed to fetch metadata:', error);
      }
    };
    
    fetchMetadata();
  }, []);

  return (
    <AppLayout categories={categories} tags={tags}>
      {children}
    </AppLayout>
  );
}