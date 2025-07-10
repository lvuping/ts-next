'use client';

import { useState, useEffect, Suspense } from 'react';
import { Sidebar } from '@/components/notes/sidebar';
import { Button } from '@/components/ui/button';
import { Home, Menu, X, Plus } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  categories?: string[];
  tags?: string[];
}

export function AppLayout({ children, categories = [], tags = [] }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div 
        className={cn(
          "transition-all duration-300",
          (sidebarOpen || sidebarHovered) && !isMobile ? "w-80" : "w-0"
        )}
        onMouseEnter={() => !sidebarOpen && setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        <div className={cn(
          "fixed h-full overflow-hidden transition-all duration-300 border-r",
          (sidebarOpen || sidebarHovered) && !isMobile ? "w-80" : "w-0"
        )}>
          <Suspense fallback={<div className="p-6">Loading...</div>}>
            <Sidebar categories={categories} tags={tags} />
          </Suspense>
        </div>
      </div>

      {/* Hover Area when sidebar is closed */}
      {!sidebarOpen && !isMobile && (
        <div
          className="fixed left-0 top-0 w-4 h-full z-10"
          onMouseEnter={() => setSidebarHovered(true)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <header className="border-b h-14 flex items-center px-4 gap-2">
          {/* Home Button - Always visible in top-left */}
          <Link href="/">
            <Button variant="ghost" size="icon" title="Go to Home">
              <Home className="h-4 w-4" />
            </Button>
          </Link>

          {/* Sidebar Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* New Note Button */}
          <Link href="/notes/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}