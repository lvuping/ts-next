import { getNotesMetadata } from '@/lib/notes-metadata';
import { getTemplates } from '@/lib/templates';
import { TemplatesLayout } from '@/components/templates/templates-layout';
import { TemplateCard } from '@/components/templates/template-card';

// Configure revalidation for templates page (1 hour)
export const revalidate = 3600;

export default async function TemplatesPage() {
  const [metadata, templates] = await Promise.all([
    getNotesMetadata(),
    getTemplates()
  ]);

  return (
    <TemplatesLayout categories={metadata.categories} tags={metadata.tags}>
      <div className="grid gap-6 md:grid-cols-2">
        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </TemplatesLayout>
  );
}