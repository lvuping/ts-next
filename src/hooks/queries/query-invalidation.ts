import { QueryClient } from '@tanstack/react-query'

interface NotesFilters {
  search?: string
  category?: string
  tag?: string
  favorite?: boolean
  sortBy?: 'createdAt' | 'updatedAt' | 'title'
  sortOrder?: 'asc' | 'desc'
}

export const queryKeys = {
  all: ['notes'] as const,
  notes: {
    all: ['notes'] as const,
    lists: () => ['notes', 'list'] as const,
    list: (filters?: NotesFilters) => ['notes', 'list', filters] as const,
    details: () => ['notes', 'detail'] as const,
    detail: (id: string) => ['notes', 'detail', id] as const,
  },
  categories: {
    all: ['categories'] as const,
  },
  tags: {
    all: ['tags'] as const,
  },
  templates: {
    all: ['templates'] as const,
  },
} as const

export class QueryInvalidator {
  constructor(private queryClient: QueryClient) {}

  invalidateNotes = async () => {
    await this.queryClient.invalidateQueries({
      queryKey: queryKeys.notes.all,
    })
  }

  invalidateNote = async (id: string) => {
    await this.queryClient.invalidateQueries({
      queryKey: queryKeys.notes.detail(id),
    })
  }

  invalidateNotesAndRelated = async (note?: { category?: string; tags?: string[] }) => {
    await this.queryClient.invalidateQueries({
      queryKey: queryKeys.notes.all,
    })
    
    if (note?.category) {
      await this.queryClient.invalidateQueries({
        queryKey: ['notes', { category: note.category }],
      })
    }
    
    if (note?.tags && note.tags.length > 0) {
      for (const tag of note.tags) {
        await this.queryClient.invalidateQueries({
          queryKey: ['notes', { tag }],
        })
      }
    }
  }

  invalidateCategories = async () => {
    await this.queryClient.invalidateQueries({
      queryKey: queryKeys.categories.all,
    })
  }

  invalidateTags = async () => {
    await this.queryClient.invalidateQueries({
      queryKey: queryKeys.tags.all,
    })
  }

  invalidateAll = async () => {
    await this.queryClient.invalidateQueries()
  }
}