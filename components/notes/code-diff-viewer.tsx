'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, X, RefreshCw, GitCompare } from 'lucide-react';
import { CodeSnippet } from './code-snippet';
import { diffLines, Change } from 'diff';
import { cn } from '@/lib/utils';

interface CodeDiffViewerProps {
  originalCode: string;
  generatedCode: string;
  language: string;
  onApply: () => void;
  onCancel: () => void;
  onRegenerate: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CodeDiffViewer({
  originalCode,
  generatedCode,
  language,
  onApply,
  onCancel,
  onRegenerate,
  open,
  onOpenChange,
}: CodeDiffViewerProps) {
  const [diffView, setDiffView] = useState<'split' | 'unified'>('split');
  const [differences, setDifferences] = useState<Change[]>([]);

  useEffect(() => {
    const changes = diffLines(originalCode, generatedCode);
    setDifferences(changes);
  }, [originalCode, generatedCode]);

  const handleApply = () => {
    onApply();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  const getDiffStats = () => {
    let added = 0;
    let removed = 0;
    
    differences.forEach((change) => {
      if (change.added) {
        added += change.count || 1;
      } else if (change.removed) {
        removed += change.count || 1;
      }
    });

    return { added, removed };
  };

  const { added, removed } = getDiffStats();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <DialogTitle className="flex items-center gap-2">
                <GitCompare className="h-5 w-5" />
                Code Comparison
              </DialogTitle>
              <div className="flex gap-2">
                <Badge variant="secondary">
                  <span className="text-green-600">+{added}</span>
                </Badge>
                <Badge variant="secondary">
                  <span className="text-red-600">-{removed}</span>
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDiffView(diffView === 'split' ? 'unified' : 'split')}
              >
                {diffView === 'split' ? 'Unified' : 'Split'} View
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-200px)]">
          <div className="p-6">
            {diffView === 'split' ? (
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-medium">Original Code</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <CodeSnippet code={originalCode} language={language} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-medium">Generated Code</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <CodeSnippet code={generatedCode} language={language} />
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">Unified Diff</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-mono text-sm">
                    {differences.map((change, index) => {
                      const lines = change.value.split('\n').filter(line => line);
                      return lines.map((line, lineIndex) => (
                        <div
                          key={`${index}-${lineIndex}`}
                          className={cn(
                            'px-2 py-0.5',
                            change.added && 'bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-200',
                            change.removed && 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-200'
                          )}
                        >
                          <span className="select-none pr-2">
                            {change.added ? '+' : change.removed ? '-' : ' '}
                          </span>
                          {line}
                        </div>
                      ));
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t bg-muted/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Review the changes and decide whether to apply them.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button variant="outline" onClick={onRegenerate}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
              <Button onClick={handleApply}>
                <Check className="h-4 w-4 mr-2" />
                Apply Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}