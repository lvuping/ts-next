'use client';

import { useState } from 'react';
import { Check, ChevronDown, Folder, Code, Server, Database, Cloud, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const icons = {
  folder: Folder,
  code: Code,
  server: Server,
  database: Database,
  cloud: Cloud,
  shield: Shield,
};

interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
  position: number;
}

interface CategorySelectorProps {
  categories: Category[];
  value: string;
  onValueChange: (value: string) => void;
}

export function CategorySelector({ categories, value, onValueChange }: CategorySelectorProps) {
  const [open, setOpen] = useState(false);
  
  const selectedCategory = categories.find(cat => cat.name === value);
  const Icon = selectedCategory ? icons[selectedCategory.icon as keyof typeof icons] || Folder : Folder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between h-8"
        >
          {selectedCategory ? (
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded flex items-center justify-center"
                style={{ backgroundColor: selectedCategory.color + '20' }}
              >
                <Icon 
                  className="h-3 w-3" 
                  style={{ color: selectedCategory.color }}
                />
              </div>
              <span className="text-sm">{selectedCategory.name}</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Select category</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search category..." className="h-9" />
          <CommandEmpty>No category found.</CommandEmpty>
          <CommandGroup>
            {categories.map((category) => {
              const CategoryIcon = icons[category.icon as keyof typeof icons] || Folder;
              return (
                <CommandItem
                  key={category.id}
                  value={category.name}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <div 
                      className="w-5 h-5 rounded flex items-center justify-center"
                      style={{ backgroundColor: category.color + '20' }}
                    >
                      <CategoryIcon 
                        className="h-3.5 w-3.5" 
                        style={{ color: category.color }}
                      />
                    </div>
                    <span className="text-sm">{category.name}</span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === category.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}