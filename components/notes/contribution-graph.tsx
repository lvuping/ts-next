'use client';

import { useState, useMemo } from 'react';
import { Note } from '@/types/note';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ContributionGraphProps {
  notes: Note[];
}

interface DayData {
  date: string;
  count: number;
  level: number;
}

export function ContributionGraph({ notes }: ContributionGraphProps) {
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);
  
  // Define helper functions before using them
  const getLevel = (count: number): number => {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 4) return 2;
    if (count <= 6) return 3;
    return 4;
  };
  
  const getLevelColor = (level: number): string => {
    switch (level) {
      case 0: return 'bg-gray-100 dark:bg-gray-800';
      case 1: return 'bg-green-200 dark:bg-green-900';
      case 2: return 'bg-green-300 dark:bg-green-700';
      case 3: return 'bg-green-400 dark:bg-green-600';
      case 4: return 'bg-green-500 dark:bg-green-500';
      default: return 'bg-gray-100 dark:bg-gray-800';
    }
  };
  
  const contributionData = useMemo(() => {
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    const dayMap = new Map<string, number>();
    
    notes.forEach(note => {
      const createdDate = new Date(note.createdAt);
      const updatedDate = new Date(note.updatedAt);
      
      const createdKey = createdDate.toISOString().split('T')[0];
      const updatedKey = updatedDate.toISOString().split('T')[0];
      
      dayMap.set(createdKey, (dayMap.get(createdKey) || 0) + 1);
      if (createdKey !== updatedKey) {
        dayMap.set(updatedKey, (dayMap.get(updatedKey) || 0) + 1);
      }
    });
    
    const weeks: DayData[][] = [];
    const currentDate = new Date(oneYearAgo);
    
    while (currentDate.getDay() !== 0) {
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    while (currentDate <= today) {
      const week: DayData[] = [];
      
      for (let i = 0; i < 7; i++) {
        const dateKey = currentDate.toISOString().split('T')[0];
        const count = dayMap.get(dateKey) || 0;
        
        week.push({
          date: dateKey,
          count,
          level: getLevel(count),
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      weeks.push(week);
    }
    
    return weeks;
  }, [notes]);
  
  const months = useMemo(() => [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ], []);
  
  const monthLabels = useMemo(() => {
    const labels: { month: string; col: number }[] = [];
    let lastMonth = -1;
    
    contributionData.forEach((week, colIndex) => {
      if (week.length > 0 && week[0]) {
        const month = new Date(week[0].date).getMonth();
        if (month !== lastMonth) {
          labels.push({ month: months[month], col: colIndex });
          lastMonth = month;
        }
      }
    });
    
    return labels;
  }, [contributionData, months]);
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">Note Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block">
            <div className="flex gap-1">
              <div className="flex flex-col gap-1 text-xs mr-2">
                <div className="h-[11px]"></div>
                <div className="h-[11px]">Mon</div>
                <div className="h-[11px]"></div>
                <div className="h-[11px]">Wed</div>
                <div className="h-[11px]"></div>
                <div className="h-[11px]">Fri</div>
                <div className="h-[11px]"></div>
              </div>
              
              <div>
                <div className="flex gap-1 mb-1 text-xs">
                  {monthLabels.map(({ month, col }, index) => (
                    <div 
                      key={`${month}-${col}`} 
                      className="h-3"
                      style={{ 
                        marginLeft: index === 0 ? '0' : `${(col - (monthLabels[index - 1]?.col || 0) - 1) * 13}px` 
                      }}
                    >
                      {month}
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-1">
                  {contributionData.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                      {week.map((day, dayIndex) => (
                        <div
                          key={`${weekIndex}-${dayIndex}`}
                          className={`w-[11px] h-[11px] rounded-sm cursor-pointer transition-all ${getLevelColor(day.level)} hover:ring-1 hover:ring-gray-400`}
                          onMouseEnter={() => setHoveredDay(day)}
                          onMouseLeave={() => setHoveredDay(null)}
                          title={`${formatDate(day.date)}: ${day.count} ${day.count === 1 ? 'activity' : 'activities'}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-4 text-xs text-gray-600 dark:text-gray-400">
              <span>Less</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map(level => (
                  <div
                    key={level}
                    className={`w-[11px] h-[11px] rounded-sm ${getLevelColor(level)}`}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
        
        {hoveredDay && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {formatDate(hoveredDay.date)}: {hoveredDay.count} {hoveredDay.count === 1 ? 'activity' : 'activities'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}