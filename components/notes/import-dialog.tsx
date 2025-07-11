'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.md') && !selectedFile.name.endsWith('.markdown')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select a Markdown file (.md or .markdown)',
        variant: 'destructive',
      });
      return;
    }

    setFile(selectedFile);
    
    // Read and preview the file
    try {
      const text = await selectedFile.text();
      // Show first 500 characters as preview
      setPreview(text.substring(0, 500) + (text.length > 500 ? '...' : ''));
    } catch (error) {
      console.error('Error reading file:', error);
      setPreview('Unable to preview file');
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/notes/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to import notes');
      }

      const result = await response.json();
      
      toast({
        title: 'Import successful',
        description: `Imported ${result.count || 0} notes`,
      });
      
      onOpenChange(false);
      
      // Refresh the page to show imported notes
      router.refresh();
      window.location.reload();
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'There was an error importing your notes',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) handleReset();
    }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Notes</DialogTitle>
          <DialogDescription>
            Import notes from a Markdown file
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-muted p-3 rounded-lg text-sm">
            <p className="font-medium mb-1">Expected format:</p>
            <p className="text-muted-foreground">
              Notes should be separated by &quot;---&quot; with title, metadata (Language, Category, Tags), and code blocks.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-upload">Select Markdown file</Label>
            <div className="flex items-center gap-2">
              <Input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                accept=".md,.markdown"
                onChange={handleFileChange}
                className="flex-1"
              />
              {file && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {file && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>{file.name}</span>
                <span>({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
              
              {preview && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-48">
                    {preview}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={importing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || importing}
          >
            {importing ? (
              <>Importing...</>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}