export interface Folder {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  noteIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FolderInput {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  noteIds?: string[];
}