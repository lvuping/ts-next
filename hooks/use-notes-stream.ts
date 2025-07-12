import { useState, useCallback, useRef } from 'react';
import type { Note } from '@/types/note';

interface UseNotesStreamOptions {
  onProgress?: (loaded: number, total: number) => void;
}

interface NotesStreamResult {
  notes: Note[];
  total: number;
  loading: boolean;
  error: string | null;
}

export function useNotesStream(options: UseNotesStreamOptions = {}) {
  const [result, setResult] = useState<NotesStreamResult>({
    notes: [],
    total: 0,
    loading: false,
    error: null,
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchNotesStream = useCallback(async (params: URLSearchParams) => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setResult(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(`/api/notes/stream?${params}`, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let notes: Note[] = [];
      let isComplete = false;

      while (!isComplete) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Try to parse complete JSON chunks
        try {
          // Check if we have a complete JSON response
          if (buffer.includes(']}')) {
            const parsed = JSON.parse(buffer);
            notes = parsed.notes;
            
            setResult({
              notes,
              total: parsed.total,
              loading: false,
              error: null,
            });

            if (options.onProgress) {
              options.onProgress(notes.length, parsed.total);
            }

            isComplete = true;
          }
        } catch (e) {
          // Not yet complete, continue reading
        }
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was cancelled, don't update state
        return;
      }

      setResult(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch notes',
      }));
    }
  }, [options]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    ...result,
    fetchNotesStream,
    cancel,
  };
}