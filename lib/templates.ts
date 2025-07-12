import { NoteTemplate } from '@/types/note';

export const noteTemplates: NoteTemplate[] = [];

export async function getTemplates(): Promise<NoteTemplate[]> {
  // In the future, this could fetch from a database or API
  return noteTemplates;
}