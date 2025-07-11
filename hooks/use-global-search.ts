import { useEffect, useState } from 'react';
import { useKeyboardShortcuts } from './use-keyboard-shortcuts';
import { useDoubleKeyPress } from './use-double-key-press';

export function useGlobalSearch() {
  const [showSearch, setShowSearch] = useState(false);

  // Forward slash key for search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
        // Only trigger if no input is focused
        const activeElement = document.activeElement;
        const isInputFocused = activeElement?.tagName === 'INPUT' || 
                              activeElement?.tagName === 'TEXTAREA' || 
                              activeElement?.getAttribute('contenteditable') === 'true';
        
        if (!isInputFocused) {
          event.preventDefault();
          setShowSearch(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Platform-specific search shortcut: Command+Space (Mac) / Alt+Space (Windows)
  useKeyboardShortcuts([
    { 
      key: ' ', // Space key
      handler: () => setShowSearch(true),
      platformSpecific: {
        mac: { metaKey: true }, // Command+Space on Mac
        windows: { altKey: true } // Alt+Space on Windows
      }
    }
  ]);

  // Double Control key press to open search
  useDoubleKeyPress({
    key: 'control',
    timeout: 300,
    handler: () => setShowSearch(true)
  });

  return { showSearch, setShowSearch };
}