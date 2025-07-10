'use client';

import { useViewMode } from '@/hooks/use-view-mode';
import { Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function ViewModeIndicator() {
  const { isViewMode } = useViewMode();
  
  if (!isViewMode) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge variant="secondary" className="px-3 py-2 text-sm flex items-center gap-2">
        <Eye className="h-4 w-4" />
        View Mode Active
      </Badge>
    </div>
  );
}