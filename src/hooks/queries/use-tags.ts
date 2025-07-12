import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './query-invalidation'

export function useTags() {
  return useQuery({
    queryKey: queryKeys.tags.all,
    queryFn: async () => {
      const response = await fetch('/api/tags')
      if (!response.ok) {
        throw new Error('Failed to fetch tags')
      }
      return response.json() as Promise<string[]>
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}