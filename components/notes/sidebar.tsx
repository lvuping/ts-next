'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Plus, Heart, FileText, Tag, FolderOpen, Search, Zap } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

interface SidebarProps {
  categories: string[];
  tags: string[];
  className?: string;
}

export function Sidebar({ categories, tags, className }: SidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      if (mobile !== isMobile) {
        setIsMobile(mobile);
      }
    };
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isMobile]);
  
  useEffect(() => {
    const searchFromParams = searchParams.get('search') || '';
    if (searchFromParams !== search) {
      setSearch(searchFromParams);
    }
  }, [searchParams, search]);

  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set('search', value);
      } else {
        params.delete('search');
      }
      router.push(`/?${params.toString()}`);
    }, 300);
  }, [router, searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };
  
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleCategoryClick = (category: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('category', category);
    params.delete('tag');
    params.delete('favorite');
    router.push(`/?${params.toString()}`);
    setIsOpen(false);
  };

  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('tag', tag);
    params.delete('category');
    params.delete('favorite');
    router.push(`/?${params.toString()}`);
    setIsOpen(false);
  };

  const handleFavoritesClick = () => {
    const params = new URLSearchParams(searchParams);
    params.set('favorite', 'true');
    params.delete('category');
    params.delete('tag');
    router.push(`/?${params.toString()}`);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    router.push('/');
    setSearch('');
    setIsOpen(false);
  };

  const SidebarContent = () => (
    <div className="space-y-6">
      <div>
        <Link href="/notes/new">
          <Button className="w-full" size="lg">
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="search"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
            autoComplete="off"
          />
        </div>
      </form>

      <div className="space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleClearFilters}
        >
          <FileText className="h-4 w-4 mr-2" />
          All Notes
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleFavoritesClick}
        >
          <Heart className="h-4 w-4 mr-2" />
          Favorites
        </Button>
        <Link href="/notes/templates">
          <Button variant="ghost" className="w-full justify-start">
            <Zap className="h-4 w-4 mr-2" />
            Templates
          </Button>
        </Link>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Categories</h3>
        <div className="space-y-1">
          {categories.map((category) => (
            <Button
              key={category}
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => handleCategoryClick(category)}
            >
              <FolderOpen className="h-3 w-3 mr-2" />
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => handleTagClick(tag)}
            >
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="fixed top-4 left-4 z-50">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className={`w-80 border-r p-6 overflow-y-auto ${className}`}>
      <SidebarContent />
    </aside>
  );
}