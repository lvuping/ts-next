import { createAuthenticatedHandler } from '@/lib/api-handler'
import { getTemplates } from '@/lib/notes'

export const GET = createAuthenticatedHandler(async () => {
  const templates = await getTemplates()
  return templates
})