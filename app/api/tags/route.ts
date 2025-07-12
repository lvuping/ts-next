import { createAuthenticatedHandler } from '@/lib/api-handler'
import { CacheControl } from '@/lib/cache-headers'
import { getTags } from '@/lib/notes'

export const GET = createAuthenticatedHandler(async () => {
  const tags = await getTags()
  return tags
}, {
  cacheControl: CacheControl.API_LIST,
  enableETag: true
})