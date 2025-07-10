import { notFound } from 'next/navigation';
import { getNoteById } from '@/lib/notes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Edit, Heart } from 'lucide-react';
import Link from 'next/link';
import { CodeSnippet } from '@/components/notes/code-snippet';

export default async function ViewNotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const note = await getNoteById(id);

  if (!note) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <CardTitle className="text-2xl font-bold">{note.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(note.createdAt).toLocaleDateString()}
                </div>
                <Badge variant="secondary">{note.category}</Badge>
                <Badge variant="outline">{note.language}</Badge>
                {note.favorite && (
                  <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                )}
              </div>
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {note.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <Link href={`/notes/edit/${note.id}`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <CodeSnippet
            code={note.content}
            language={note.language}
          />
        </CardContent>
      </Card>
    </div>
  );
}