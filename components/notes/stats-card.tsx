'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Heart, Tag, TrendingUp } from 'lucide-react';
import { Note } from '@/types/note';
import { ContributionGraph } from './contribution-graph';

interface StatsCardProps {
  notes: Note[];
  categories: Array<{ id: number; name: string; color: string; icon: string; position: number }> | string[];
  tags: string[];
}

export function StatsCard({ notes, categories, tags }: StatsCardProps) {
  const favoriteCount = notes.filter(note => note.favorite).length;
  const languageStats = notes.reduce((acc, note) => {
    acc[note.language] = (acc[note.language] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topLanguages = Object.entries(languageStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  
  // Future: Add recent notes and monthly activity tracking

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notes.length}</div>
            <p className="text-xs text-muted-foreground">
              Across {categories.length} categories
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{favoriteCount}</div>
            <p className="text-xs text-muted-foreground">
              {((favoriteCount / notes.length) * 100).toFixed(0)}% of all notes
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tags Used</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tags.length}</div>
            <p className="text-xs text-muted-foreground">
              Unique tags
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Language</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {topLanguages[0]?.[0] || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {topLanguages[0]?.[1] || 0} notes
            </p>
          </CardContent>
        </Card>
      </div>
      
      <ContributionGraph notes={notes} />
    </div>
  );
}