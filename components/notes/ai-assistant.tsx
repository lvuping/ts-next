'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIAssistantProps {
  noteId: string;
  noteContent: string;
}

export function AIAssistant({ noteId, noteContent }: AIAssistantProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAssist = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a prompt for the AI assistant',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Store the prompt in sessionStorage to pass to edit mode
      sessionStorage.setItem(`ai-assist-${noteId}`, JSON.stringify({
        prompt: prompt.trim(),
        originalContent: noteContent,
        timestamp: Date.now()
      }));
      
      // Navigate to edit mode
      router.push(`/notes/edit/${noteId}?ai-assist=true`);
    } catch (error) {
      console.error('AI assist error:', error);
      toast({
        title: 'Error',
        description: 'Failed to process AI assistance request',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Describe what you'd like to change or improve in this note..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          className="resize-none"
        />
        <Button 
          onClick={handleAssist} 
          disabled={isProcessing || !prompt.trim()}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Assist
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}