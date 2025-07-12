import { useQuery } from '@tanstack/react-query'
import type { NoteTemplate } from '@/types/note'
import { queryKeys } from './query-invalidation'

export function useTemplates() {
  return useQuery({
    queryKey: queryKeys.templates.all,
    queryFn: async () => {
      const response = await fetch('/api/templates')
      if (!response.ok) {
        throw new Error('Failed to fetch templates')
      }
      return response.json() as Promise<NoteTemplate[]>
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - templates rarely change
  })
}