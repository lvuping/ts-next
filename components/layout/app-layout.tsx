'use client';

import { useState, useEffect, Suspense } from 'react';
import { Sidebar } from '@/components/notes/sidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
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
            <Sidebar categories={categories} tags={tags} onClose={() => setSidebarOpen(false)} />
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
      <div className="flex-1 relative">
        {/* Floating Sidebar Toggle Button */}
        {!sidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            title="Show Sidebar"
            className="fixed top-4 left-4 z-50"
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}

        {/* Page Content */}
        <main className="h-full overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}