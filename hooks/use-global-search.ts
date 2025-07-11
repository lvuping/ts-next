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

  // Double Control key for search
  useDoubleKeyPress({
    key: 'Control',
    handler: () => setShowSearch(true),
  });

  return { showSearch, setShowSearch };
}