'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Heart, FileText, Tag, FolderOpen, Zap, Plus, ChevronLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SidebarProps {
  categories: string[];
  tags: string[];
  className?: string;
  onClose?: () => void;
}

export function Sidebar({ categories, tags, className, onClose }: SidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
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
    setIsOpen(false);
  };

  const SidebarContent = () => (
    <div className="space-y-6">
      {/* Header with PKM and hide button */}
      <div className="group flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <h1 className="text-xl font-bold">PKM</h1>
        </Link>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
            title="Hide sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* New Note Button */}
      <Link href="/notes/new" className="block">
        <Button className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </Link>

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