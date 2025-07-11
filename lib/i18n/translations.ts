export type Language = 'en' | 'ko' | 'de';

export const translations = {
  en: {
    // Common
    app: {
      name: 'Notes App',
      loading: 'Loading...',
      error: 'An error occurred',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      logout: 'Logout',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
    },
    
    // Navigation
    nav: {
      home: 'Home',
      newNote: 'New Note',
      categories: 'Categories',
      tags: 'Tags',
      favorites: 'Favorites',
      allNotes: 'All Notes',
    },
    
    // Notes
    notes: {
      title: 'Title',
      content: 'Content',
      language: 'Language',
      category: 'Category',
      tags: 'Tags',
      summary: 'Summary',
      generateSummary: 'Generate Summary',
      regenerateSummary: 'Regenerate',
      generateTags: 'Generate Tags',
      suggestTags: 'Suggest Tags',
      addTag: 'Add tag...',
      noNotes: 'No notes found',
      createFirst: 'Create your first note',
      untitled: 'Untitled Note',
      preview: 'Preview',
      aiAssist: 'AI Assist',
      aiAssistPlaceholder: 'Ask AI to help write or modify code...',
      generating: 'Generating...',
      startWriting: 'Start writing your code or notes...',
    },
    
    // Actions
    actions: {
      save: 'Save',
      saveChanges: 'Save Changes',
      create: 'Create',
      createNote: 'Create Note',
      delete: 'Delete',
      deleteNote: 'Delete Note',
      confirmDelete: 'Are you sure you want to delete this note?',
      confirmDescription: 'This action cannot be undone.',
    },
    
    // Categories (for UI labels, not the actual category names)
    categories: {
      label: 'Categories',
      all: 'All Categories',
    },
    
    // Settings
    settings: {
      language: 'Language',
      selectLanguage: 'Select Language',
      theme: 'Theme',
    },
  },
  
  ko: {
    // Common
    app: {
      name: '노트 앱',
      loading: '로딩 중...',
      error: '오류가 발생했습니다',
      save: '저장',
      cancel: '취소',
      delete: '삭제',
      edit: '편집',
      create: '생성',
      search: '검색',
      logout: '로그아웃',
      darkMode: '다크 모드',
      lightMode: '라이트 모드',
    },
    
    // Navigation
    nav: {
      home: '홈',
      newNote: '새 노트',
      categories: '카테고리',
      tags: '태그',
      favorites: '즐겨찾기',
      allNotes: '모든 노트',
    },
    
    // Notes
    notes: {
      title: '제목',
      content: '내용',
      language: '언어',
      category: '카테고리',
      tags: '태그',
      summary: '요약',
      generateSummary: '요약 생성',
      regenerateSummary: '재생성',
      generateTags: '태그 생성',
      suggestTags: '태그 제안',
      addTag: '태그 추가...',
      noNotes: '노트가 없습니다',
      createFirst: '첫 번째 노트를 만들어보세요',
      untitled: '제목 없음',
      preview: '미리보기',
      aiAssist: 'AI 지원',
      aiAssistPlaceholder: 'AI에게 코드 작성이나 수정을 도와달라고 요청하세요...',
      generating: '생성 중...',
      startWriting: '코드나 노트 작성을 시작하세요...',
    },
    
    // Actions
    actions: {
      save: '저장',
      saveChanges: '변경사항 저장',
      create: '생성',
      createNote: '노트 생성',
      delete: '삭제',
      deleteNote: '노트 삭제',
      confirmDelete: '이 노트를 삭제하시겠습니까?',
      confirmDescription: '이 작업은 되돌릴 수 없습니다.',
    },
    
    // Categories
    categories: {
      label: '카테고리',
      all: '모든 카테고리',
    },
    
    // Settings
    settings: {
      language: '언어',
      selectLanguage: '언어 선택',
      theme: '테마',
    },
  },
  
  de: {
    // Common
    app: {
      name: 'Notizen App',
      loading: 'Laden...',
      error: 'Ein Fehler ist aufgetreten',
      save: 'Speichern',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      create: 'Erstellen',
      search: 'Suchen',
      logout: 'Abmelden',
      darkMode: 'Dunkler Modus',
      lightMode: 'Heller Modus',
    },
    
    // Navigation
    nav: {
      home: 'Start',
      newNote: 'Neue Notiz',
      categories: 'Kategorien',
      tags: 'Tags',
      favorites: 'Favoriten',
      allNotes: 'Alle Notizen',
    },
    
    // Notes
    notes: {
      title: 'Titel',
      content: 'Inhalt',
      language: 'Sprache',
      category: 'Kategorie',
      tags: 'Tags',
      summary: 'Zusammenfassung',
      generateSummary: 'Zusammenfassung generieren',
      regenerateSummary: 'Neu generieren',
      generateTags: 'Tags generieren',
      suggestTags: 'Tags vorschlagen',
      addTag: 'Tag hinzufügen...',
      noNotes: 'Keine Notizen gefunden',
      createFirst: 'Erstellen Sie Ihre erste Notiz',
      untitled: 'Ohne Titel',
      preview: 'Vorschau',
      aiAssist: 'KI-Assistent',
      aiAssistPlaceholder: 'Bitten Sie die KI um Hilfe beim Schreiben oder Ändern von Code...',
      generating: 'Generieren...',
      startWriting: 'Beginnen Sie mit dem Schreiben Ihres Codes oder Ihrer Notizen...',
    },
    
    // Actions
    actions: {
      save: 'Speichern',
      saveChanges: 'Änderungen speichern',
      create: 'Erstellen',
      createNote: 'Notiz erstellen',
      delete: 'Löschen',
      deleteNote: 'Notiz löschen',
      confirmDelete: 'Möchten Sie diese Notiz wirklich löschen?',
      confirmDescription: 'Diese Aktion kann nicht rückgängig gemacht werden.',
    },
    
    // Categories
    categories: {
      label: 'Kategorien',
      all: 'Alle Kategorien',
    },
    
    // Settings
    settings: {
      language: 'Sprache',
      selectLanguage: 'Sprache wählen',
      theme: 'Thema',
    },
  },
};

export function getTranslation(lang: Language) {
  return translations[lang] || translations.en;
}