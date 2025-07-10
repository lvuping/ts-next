'use client';

import { create } from 'zustand';
import { useEffect } from 'react';

interface ViewModeStore {
  isViewMode: boolean;
  setViewMode: (mode: boolean) => void;
}

const useViewModeStore = create<ViewModeStore>((set) => ({
  isViewMode: false,
  setViewMode: (mode) => set({ isViewMode: mode }),
}));

export function useViewMode() {
  const { isViewMode, setViewMode } = useViewModeStore();
  
  useEffect(() => {
    let lastControlTime = 0;
    const DOUBLE_PRESS_DELAY = 300;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Control') {
        const currentTime = Date.now();
        if (currentTime - lastControlTime < DOUBLE_PRESS_DELAY) {
          setViewMode(true);
          setTimeout(() => setViewMode(false), 5000);
        }
        lastControlTime = currentTime;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setViewMode]);
  
  return { isViewMode, setViewMode };
}