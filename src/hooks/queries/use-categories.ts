import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys, QueryInvalidator } from './query-invalidation'

interface Category {
  id: number
  name: string
  color: string
  icon: string
  position: number
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: async () => {
      const response = await fetch('/api/categories')
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      return response.json() as Promise<Category[]>
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  const invalidator = new QueryInvalidator(queryClient)
  
  return useMutation({
    mutationFn: async (data: Omit<Category, 'id'>) => {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create category')
      }
      
      return response.json() as Promise<Category>
    },
    onMutate: async (newCategory) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.categories.all })
      
      const previousCategories = queryClient.getQueryData<Category[]>(queryKeys.categories.all)
      
      const optimisticCategory: Category = {
        id: Date.now(),
        ...newCategory,
      }
      
      queryClient.setQueryData<Category[]>(
        queryKeys.categories.all,
        (old) => old ? [...old, optimisticCategory] : [optimisticCategory]
      )
      
      return { previousCategories }
    },
    onError: (err, newCategory, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(queryKeys.categories.all, context.previousCategories)
      }
    },
    onSuccess: () => {
      invalidator.invalidateCategories()
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  const invalidator = new QueryInvalidator(queryClient)
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Omit<Category, 'id'>> }) => {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update category')
      }
      
      return response.json() as Promise<Category>
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.categories.all })
      
      const previousCategories = queryClient.getQueryData<Category[]>(queryKeys.categories.all)
      
      queryClient.setQueryData<Category[]>(
        queryKeys.categories.all,
        (old) => old?.map(cat => cat.id === id ? { ...cat, ...data } : cat)
      )
      
      return { previousCategories }
    },
    onError: (err, variables, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(queryKeys.categories.all, context.previousCategories)
      }
    },
    onSuccess: () => {
      invalidator.invalidateCategories()
      invalidator.invalidateNotes()
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  const invalidator = new QueryInvalidator(queryClient)
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete category')
      }
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.categories.all })
      
      const previousCategories = queryClient.getQueryData<Category[]>(queryKeys.categories.all)
      
      queryClient.setQueryData<Category[]>(
        queryKeys.categories.all,
        (old) => old?.filter(cat => cat.id !== id)
      )
      
      return { previousCategories }
    },
    onError: (err, id, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(queryKeys.categories.all, context.previousCategories)
      }
    },
    onSuccess: () => {
      invalidator.invalidateCategories()
      invalidator.invalidateNotes()
    },
  })
}