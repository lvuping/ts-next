import { useEffect } from 'react';

interface ShortcutHandler {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  handler: () => void;
  // Platform-specific shortcuts
  platformSpecific?: {
    mac?: {
      metaKey?: boolean;
      altKey?: boolean;
      ctrlKey?: boolean;
      shiftKey?: boolean;
    };
    windows?: {
      metaKey?: boolean;
      altKey?: boolean;
      ctrlKey?: boolean;
      shiftKey?: boolean;
    };
  };
}

export function useKeyboardShortcuts(shortcuts: ShortcutHandler[]) {
  useEffect(() => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        let needsCtrl = shortcut.ctrlKey === true;
        let needsShift = shortcut.shiftKey === true;
        let needsAlt = shortcut.altKey === true;
        let needsMeta = shortcut.metaKey === true;
        
        // Handle platform-specific shortcuts
        if (shortcut.platformSpecific) {
          const platformConfig = isMac ? shortcut.platformSpecific.mac : shortcut.platformSpecific.windows;
          if (platformConfig) {
            needsCtrl = platformConfig.ctrlKey === true;
            needsShift = platformConfig.shiftKey === true;
            needsAlt = platformConfig.altKey === true;
            needsMeta = platformConfig.metaKey === true;
          }
        }
        
        // For backward compatibility: on Mac, treat Ctrl as Cmd for non-platform-specific shortcuts
        const ctrlOrMetaPressed = shortcut.platformSpecific 
          ? (needsCtrl && event.ctrlKey) || (needsMeta && event.metaKey)
          : event.ctrlKey || event.metaKey;
        
        // Check if all required modifiers match exactly
        const modifiersMatch = shortcut.platformSpecific
          ? (needsCtrl === event.ctrlKey) &&
            (needsMeta === event.metaKey) &&
            (needsShift === event.shiftKey) &&
            (needsAlt === event.altKey)
          : (needsCtrl === ctrlOrMetaPressed) &&
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