'use client';

import { useState, useEffect, Suspense } from 'react';
import { Sidebar } from '@/components/notes/sidebar';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/spinner';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  categories?: Array<{ id: number; name: string; color: string; icon: string; position: number }>;
  tags?: string[];
}

export function AppLayout({ children, categories = [], tags = [] }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSidebarToggle = (open: boolean) => {
    setIsTransitioning(true);
    setSidebarOpen(open);
    setTimeout(() => setIsTransitioning(false), 150);
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div 
        className={cn(
          "transition-all duration-200 ease-out flex-shrink-0",
          (sidebarOpen || sidebarHovered) && !isMobile ? "w-64" : "w-0"
        )}
        onMouseEnter={() => !sidebarOpen && !isTransitioning && setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        <div className={cn(
          "fixed h-full overflow-hidden transition-all duration-200 ease-out border-r bg-background/95 backdrop-blur-sm shadow-sm",
          (sidebarOpen || sidebarHovered) && !isMobile ? "w-64" : "w-0"
        )}>
          <Suspense fallback={<LoadingSpinner />}>
            <Sidebar categories={categories} tags={tags} onClose={() => handleSidebarToggle(false)} />
          </Suspense>
        </div>
      </div>

      {/* Hover Area when sidebar is closed */}
      {!sidebarOpen && !isMobile && !isTransitioning && (
        <div
          className="fixed left-0 top-0 w-8 h-full z-10 bg-gradient-to-r from-black/5 to-transparent"
          onMouseEnter={() => setSidebarHovered(true)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 relative min-w-0">
        {/* Floating Sidebar Toggle Button */}
        {!sidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleSidebarToggle(true)}
            title="Show Sidebar"
            className="fixed top-4 left-4 z-50 transition-opacity duration-200 hover:bg-accent"
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}

        {/* Page Content */}
        <main className="h-full overflow-auto">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}