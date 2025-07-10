import { useEffect, useRef, useCallback } from 'react';

interface DoubleKeyPressOptions {
  key: string;
  timeout?: number; // Time window for double press in ms
  handler: () => void;
}

export function useDoubleKeyPress({ key, timeout = 300, handler }: DoubleKeyPressOptions) {
  const lastPressTime = useRef<number>(0);
  const pressCount = useRef<number>(0);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  const resetPressCount = useCallback(() => {
    pressCount.current = 0;
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
      timeoutId.current = null;
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if the pressed key matches (case-insensitive)
      if (event.key.toLowerCase() !== key.toLowerCase()) {
        return;
      }

      // For Control key detection
      if (key.toLowerCase() === 'control' && !event.ctrlKey) {
        return;
      }

      const currentTime = Date.now();
      const timeSinceLastPress = currentTime - lastPressTime.current;

      // If within the timeout window, increment press count
      if (timeSinceLastPress <= timeout) {
        pressCount.current++;
        
        // If double press detected, trigger handler
        if (pressCount.current === 2) {
          event.preventDefault();
          handler();
          resetPressCount();
        }
      } else {
        // Reset and start counting from 1
        pressCount.current = 1;
      }

      lastPressTime.current = currentTime;

      // Clear any existing timeout
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }

      // Set a new timeout to reset the press count
      timeoutId.current = setTimeout(() => {
        resetPressCount();
      }, timeout);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [key, timeout, handler, resetPressCount]);
}