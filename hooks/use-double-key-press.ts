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
      // For Control key detection, check the key property
      if (key.toLowerCase() === 'control') {
        if (event.key !== 'Control' && !event.ctrlKey) {
          return;
        }
      } else if (event.key.toLowerCase() !== key.toLowerCase()) {
        // For other keys, check if the pressed key matches (case-insensitive)
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

    // For Control key, also prevent default behavior on keyup
    const handleKeyUp = (event: KeyboardEvent) => {
      if (key.toLowerCase() === 'control' && event.key === 'Control') {
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    if (key.toLowerCase() === 'control') {
      window.addEventListener('keyup', handleKeyUp);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (key.toLowerCase() === 'control') {
        window.removeEventListener('keyup', handleKeyUp);
      }
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [key, timeout, handler, resetPressCount]);
}