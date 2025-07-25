'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Search, BarChart3, Download, Upload, LogOut } from 'lucide-react';
import { LanguageSelector } from '@/components/ui/language-selector';
import { useLanguage } from '@/contexts/language-context';

interface AppHeaderProps {
  title: string;
  showSearch?: boolean;
  showStats?: boolean;
  showExport?: boolean;
  showImport?: boolean;
  showThemeToggle?: boolean;
  showLogout?: boolean;
  onSearch?: () => void;
  onStats?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  subtitle?: React.ReactNode;
}

export function AppHeader({
  title,
  showSearch = true,
  showStats = false,
  showExport = false,
  showImport = false,
  showThemeToggle = true,
  showLogout = true,
  onSearch,
  onStats,
  onExport,
  onImport,
  subtitle,
}: AppHeaderProps) {
  const router = useRouter();
  const { t } = useLanguage();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      router.push('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <header className="border-b-2 border-border/50 px-4 md:px-6 py-3 md:py-4 flex-shrink-0 bg-gradient-to-r from-background to-background/95 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent truncate">
          {title}
        </h1>
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          {showSearch && onSearch && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onSearch}
              title={t.app.search}
              className="h-8 w-8 md:h-9 md:w-9"
            >
              <Search className="h-4 w-4" />
            </Button>
          )}
          {showStats && onStats && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onStats}
              className="h-8 w-8 md:h-9 md:w-9"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          )}
          {showExport && onExport && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onExport}
              title="Export notes"
              className="h-8 w-8 md:h-9 md:w-9 hidden sm:flex"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          {showImport && onImport && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onImport}
              title="Import notes"
              className="h-8 w-8 md:h-9 md:w-9 hidden sm:flex"
            >
              <Upload className="h-4 w-4" />
            </Button>
          )}
          <LanguageSelector />
          {showThemeToggle && <ThemeToggle />}
          {showLogout && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout} 
              title={t.app.logout}
              className="h-8 w-8 md:h-9 md:w-9"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      {subtitle && (
        <div className="mt-2">
          {subtitle}
        </div>
      )}
    </header>
  );
}