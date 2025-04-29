
export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  content?: string; // For searchable content
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  folderId: string | null;
  ownerId: string;
  accessList: AccessControl[];
  versions: DocumentVersion[];
  annotations: Annotation[];
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  url: string;
  createdAt: Date;
  createdBy: string;
  size: number;
}

export interface Annotation {
  id: string;
  documentId: string;
  type: 'highlight' | 'comment' | 'note';
  content: string;
  position?: {
    page: number;
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  createdBy: string;
  createdAt: Date;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface AccessControl {
  userId: string;
  userName: string;
  permissionLevel: 'view' | 'edit' | 'download' | 'admin';
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export type ViewMode = 'grid' | 'list';
