'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, getTranslation } from '@/lib/i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: ReturnType<typeof getTranslation>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [translations, setTranslations] = useState(getTranslation('en'));

  useEffect(() => {
    // Load saved language from localStorage
    const savedLang = localStorage.getItem('preferred-language') as Language;
    if (savedLang && ['en', 'ko', 'de'].includes(savedLang)) {
      setLanguageState(savedLang);
      setTranslations(getTranslation(savedLang));
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setTranslations(getTranslation(lang));
    localStorage.setItem('preferred-language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}