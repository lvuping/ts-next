import { createAuthenticatedHandler } from '@/lib/api-handler'
import { getTags } from '@/lib/notes'

export const GET = createAuthenticatedHandler(async () => {
  const tags = await getTags()
  return tags
})