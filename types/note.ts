import { Folder } from './folder';

export interface Note {
  id: string;
  title: string;
  content: string;
  language: string;
  category: string;
  tags: string[];
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
  relatedNotes?: string[];
  template?: string;
  folderId?: string;
}

export interface NoteInput {
  title: string;
  content: string;
  language: string;
  category: string;
  tags: string[];
  favorite: boolean;
  relatedNotes?: string[];
  template?: string;
  folderId?: string;
}

export interface NoteTemplate {
  id: string;
  name: string;
  description: string;
  language: string;
  content: string;
  category: string;
}

export interface NotesData {
  notes: Note[];
  categories: string[];
  tags: string[];
  templates: NoteTemplate[];
  folders: Folder[];
}

export interface SearchParams {
  search?: string;
  category?: string;
  tag?: string;
  favorite?: boolean;
}