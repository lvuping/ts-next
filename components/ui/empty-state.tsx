import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center h-64 space-y-4 ${className}`}>
      {Icon && (
        <Icon className="h-12 w-12 text-muted-foreground/50" />
      )}
      <div className="text-center space-y-2">
        <p className="text-muted-foreground font-medium">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground/80">{description}</p>
        )}
      </div>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}