import { getCategories, getTags } from '@/lib/notes';

export interface NotesMetadata {
  categories: Array<{ id: number; name: string; color: string; icon: string; position: number }>;
  tags: string[];
}

export async function getNotesMetadata(): Promise<NotesMetadata> {
  const [categories, tags] = await Promise.all([
    getCategories(),
    getTags()
  ]);

  return {
    categories,
    tags
  };
}