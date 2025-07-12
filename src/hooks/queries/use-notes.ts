import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Note, NoteInput } from '@/types/note'
import { queryKeys, QueryInvalidator } from './query-invalidation'

interface NotesFilters {
  search?: string
  category?: string
  tag?: string
  favorite?: boolean
  sortBy?: 'createdAt' | 'updatedAt' | 'title'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export function useNotes(filters?: NotesFilters) {
  return useQuery({
    queryKey: filters ? queryKeys.notes.list(filters) : queryKeys.notes.lists(),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.search) params.append('search', filters.search)
      if (filters?.category) params.append('category', filters.category)
      if (filters?.tag) params.append('tag', filters.tag)
      if (filters?.favorite !== undefined) params.append('favorite', String(filters.favorite))
      if (filters?.sortBy) params.append('sortBy', filters.sortBy)
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)
      if (filters?.limit !== undefined) params.append('limit', String(filters.limit))
      if (filters?.offset !== undefined) params.append('offset', String(filters.offset))
      
      const response = await fetch(`/api/notes?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch notes')
      }
      return response.json() as Promise<{ notes: Note[]; total: number }>
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection time)
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false // Don't refetch on mount if data exists
  })
}

export function useNote(id: string) {
  return useQuery({
    queryKey: queryKeys.notes.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/notes/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch note')
      }
      return response.json() as Promise<Note>
    },
    enabled: !!id,
  })
}

export function useCreateNote() {
  const queryClient = useQueryClient()
  const invalidator = new QueryInvalidator(queryClient)
  
  return useMutation({
    mutationFn: async (data: NoteInput) => {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create note')
      }
      
      return response.json() as Promise<Note>
    },
    onMutate: async (newNote) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notes.all })
      
      const previousNotes = queryClient.getQueryData(queryKeys.notes.lists())
      
      const optimisticNote: Note = {
        id: `temp-${Date.now()}`,
        ...newNote,
        tags: newNote.tags || [],
        favorite: newNote.favorite || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        relatedNotes: newNote.relatedNotes || [],
      }
      
      queryClient.setQueriesData<Note[]>(
        { queryKey: queryKeys.notes.all },
        (old) => old ? [optimisticNote, ...old] : [optimisticNote]
      )
      
      return { previousNotes }
    },
    onError: (err, newNote, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(queryKeys.notes.lists(), context.previousNotes)
      }
    },
    onSuccess: (data) => {
      invalidator.invalidateNotesAndRelated(data)
    },
  })
}

export function useUpdateNote() {
  const queryClient = useQueryClient()
  const invalidator = new QueryInvalidator(queryClient)
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<NoteInput> }) => {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update note')
      }
      
      return response.json() as Promise<Note>
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notes.detail(id) })
      await queryClient.cancelQueries({ queryKey: queryKeys.notes.all })
      
      const previousNote = queryClient.getQueryData<Note>(queryKeys.notes.detail(id))
      const previousNotes = queryClient.getQueryData<Note[]>(queryKeys.notes.lists())
      
      if (previousNote) {
        const updatedNote = { ...previousNote, ...data, updatedAt: new Date().toISOString() }
        queryClient.setQueryData(queryKeys.notes.detail(id), updatedNote)
        
        queryClient.setQueriesData<Note[]>(
          { queryKey: queryKeys.notes.all },
          (old) => old?.map(note => note.id === id ? updatedNote : note)
        )
      }
      
      return { previousNote, previousNotes }
    },
    onError: (err, { id }, context) => {
      if (context?.previousNote) {
        queryClient.setQueryData(queryKeys.notes.detail(id), context.previousNote)
      }
      if (context?.previousNotes) {
        queryClient.setQueryData(queryKeys.notes.lists(), context.previousNotes)
      }
    },
    onSuccess: (data) => {
      invalidator.invalidateNote(data.id)
      invalidator.invalidateNotesAndRelated(data)
    },
  })
}

export function useDeleteNote() {
  const queryClient = useQueryClient()
  const invalidator = new QueryInvalidator(queryClient)
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete note')
      }
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notes.all })
      
      const previousNotes = queryClient.getQueryData<Note[]>(queryKeys.notes.lists())
      
      // Update all queries containing the note
      queryClient.setQueriesData<{ notes: Note[]; total: number }>(
        { queryKey: ['notes', 'list'] },
        (old) => {
          if (!old) return old
          return {
            notes: old.notes.filter(note => note.id !== id),
            total: old.total - 1
          }
        }
      )
      
      return { previousNotes }
    },
    onError: (err, id, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(queryKeys.notes.lists(), context.previousNotes)
      }
    },
    onSettled: () => {
      // Only invalidate after a delay to prevent immediate refetch
      setTimeout(() => {
        invalidator.invalidateNotes()
      }, 100)
    },
  })
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()
  const invalidator = new QueryInvalidator(queryClient)
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/notes/${id}/favorite`, {
        method: 'PATCH',
      })
      
      if (!response.ok) {
        throw new Error('Failed to toggle favorite')
      }
      
      return response.json() as Promise<Note>
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notes.detail(id) })
      await queryClient.cancelQueries({ queryKey: queryKeys.notes.all })
      
      // Get all cached data
      const previousQueries = new Map()
      
      // Update all queries containing the note
      queryClient.setQueriesData<{ notes: Note[]; total: number }>(
        { queryKey: ['notes', 'list'] },
        (old) => {
          if (!old) return old
          previousQueries.set(['notes', 'list'], old)
          
          return {
            ...old,
            notes: old.notes.map(note => {
              if (note.id === id) {
                return { ...note, favorite: !note.favorite }
              }
              return note
            })
          }
        }
      )
      
      return { previousQueries }
    },
    onError: (err, id, context) => {
      // Restore all previous queries
      if (context?.previousQueries) {
        context.previousQueries.forEach((data, key) => {
          queryClient.setQueryData(key, data)
        })
      }
    },
    onSettled: (data) => {
      // Only invalidate specific note detail after a delay
      if (data) {
        setTimeout(() => {
          invalidator.invalidateNote(data.id)
        }, 100)
      }
    },
  })
}