'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/language-context';
import type { Language } from '@/lib/i18n/translations';

const languages: { value: Language; label: string; flag: string }[] = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'ko', label: '한국어', flag: '🇰🇷' },
  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  
  const currentLang = languages.find(l => l.value === language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9">
          <span className="text-base md:text-lg">{currentLang.flag}</span>
          <span className="sr-only">Select Language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.value}
            onClick={() => setLanguage(lang.value)}
            className={language === lang.value ? 'bg-accent' : ''}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}