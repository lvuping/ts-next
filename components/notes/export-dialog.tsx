'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Note } from '@/types/note';
import { useToast } from '@/hooks/use-toast';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notes: Note[];
}

export function ExportDialog({ open, onOpenChange, notes }: ExportDialogProps) {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const handleExportAll = async () => {
    setExporting(true);
    try {
      const response = await fetch('/api/notes/export');
      if (!response.ok) {
        throw new Error('Failed to export notes');
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] || 'notes-export.md';

      // Download the file
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      toast({
        title: 'Export successful',
        description: `Exported all ${notes.length} notes`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export failed',
        description: 'There was an error exporting your notes',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Notes</DialogTitle>
          <DialogDescription>
            Export all your notes as a Markdown file
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            This will export all {notes.length} notes in your collection as a single Markdown file.
            The file will include the title, language, category, tags, and content of each note.
          </p>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={exporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExportAll}
            disabled={exporting || notes.length === 0}
          >
            {exporting ? (
              <>Exporting...</>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export All Notes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}