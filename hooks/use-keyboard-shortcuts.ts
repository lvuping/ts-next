import { useEffect } from 'react';

interface ShortcutHandler {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  handler: () => void;
}

export function useKeyboardShortcuts(shortcuts: ShortcutHandler[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const needsCtrl = shortcut.ctrlKey === true;
        const needsShift = shortcut.shiftKey === true;
        const needsAlt = shortcut.altKey === true;
        const needsMeta = shortcut.metaKey === true;
        
        const ctrlOrMetaPressed = event.ctrlKey || event.metaKey;
        
        // Check if all required modifiers match exactly
        const modifiersMatch = 
          (needsCtrl === ctrlOrMetaPressed) &&
          (needsShift === event.shiftKey) &&
          (needsAlt === event.altKey);
        
        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          modifiersMatch
        ) {
          event.preventDefault();
          shortcut.handler();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}