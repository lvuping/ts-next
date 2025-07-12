'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AppHeader } from '@/components/layout/app-header';
import { AppLayout } from '@/components/layout/app-layout';
import { Note } from '@/types/note';
import { useGlobalSearch } from '@/hooks/use-global-search';

const SearchDialog = dynamic(() => import('@/components/notes/search-dialog').then(mod => ({ default: mod.SearchDialog })), {
  ssr: false,
});

interface TemplatesLayoutProps {
  categories: Array<{ id: number; name: string; color: string; icon: string; position: number }>;
  tags: string[];
  children: React.ReactNode;
}

export function TemplatesLayout({ categories, tags, children }: TemplatesLayoutProps) {
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const { showSearch, setShowSearch } = useGlobalSearch();

  useEffect(() => {
    if (showSearch && allNotes.length === 0) {
      fetchAllNotes();
    }
  }, [showSearch, allNotes.length]);

  const fetchAllNotes = async () => {
    try {
      const response = await fetch('/api/notes');
      if (response.ok) {
        const data = await response.json();
        setAllNotes(data);
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    }
  };

  return (
    <AppLayout categories={categories} tags={tags}>
      <div className="h-full flex flex-col">
        <AppHeader 
          title="Code Templates" 
          showSearch={true}
          showThemeToggle={true}
          showLogout={true}
          onSearch={() => setShowSearch(true)}
        />

        <main className="flex-1 overflow-y-auto px-6 py-4">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <SearchDialog 
        open={showSearch} 
        onOpenChange={setShowSearch} 
        notes={allNotes} 
      />
    </AppLayout>
  );
}