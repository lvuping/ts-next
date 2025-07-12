/**
 * Centralized revalidation configuration for Next.js ISR and on-demand revalidation
 */

// Time-based revalidation intervals (in seconds)
export const REVALIDATION_INTERVALS = {
  // Static content that rarely changes
  STATIC: 86400, // 24 hours
  
  // Semi-static content like templates
  TEMPLATES: 3600, // 1 hour
  
  // Dynamic content that changes frequently
  NOTES_LIST: 60, // 1 minute
  NOTE_DETAIL: 60, // 1 minute
  
  // User-specific content
  CATEGORIES: 300, // 5 minutes
  TAGS: 300, // 5 minutes
  
  // Real-time content (no revalidation)
  REALTIME: false,
} as const;

// Tags for on-demand revalidation
export const REVALIDATION_TAGS = {
  ALL_NOTES: 'all-notes',
  NOTE: (id: string) => `note-${id}`,
  CATEGORIES: 'categories',
  TAGS: 'tags',
  TEMPLATES: 'templates',
  USER_DATA: 'user-data',
} as const;

// Helper to revalidate specific paths
export async function revalidateNoteData(noteId?: string) {
  if (typeof window === 'undefined') {
    // Server-side only
    // Make revalidation non-blocking for better performance
    setImmediate(async () => {
      try {
        const { revalidateTag, revalidatePath } = await import('next/cache');
        
        // Revalidate all notes list
        revalidateTag(REVALIDATION_TAGS.ALL_NOTES);
        
        // Revalidate specific note if ID provided
        if (noteId) {
          revalidateTag(REVALIDATION_TAGS.NOTE(noteId));
          // Only revalidate path if not deleting
          revalidatePath(`/notes/view/${noteId}`);
        }
        
        // Skip home page revalidation for better performance
      } catch (error) {
        console.error('Revalidation error:', error);
      }
    });
  }
}

// Helper to revalidate category data
export async function revalidateCategoryData() {
  if (typeof window === 'undefined') {
    try {
      const { revalidateTag } = await import('next/cache');
      revalidateTag(REVALIDATION_TAGS.CATEGORIES);
    } catch (error) {
      console.error('Category revalidation error:', error);
    }
  }
}

// Helper to revalidate tag data
export async function revalidateTagData() {
  if (typeof window === 'undefined') {
    try {
      const { revalidateTag } = await import('next/cache');
      revalidateTag(REVALIDATION_TAGS.TAGS);
    } catch (error) {
      console.error('Tag revalidation error:', error);
    }
  }
}