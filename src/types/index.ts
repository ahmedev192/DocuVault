// Document types
export interface Document {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: FileType;
  fileSize: number;
  folderId: string;
  tags: Tag[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  versions: DocumentVersion[];
  currentVersion: number;
  totalPages: number;
  access: Record<string, AccessLevel>;
}

export interface DocumentVersion {
  versionNumber: number;
  fileUrl: string;
  createdAt: Date;
  createdBy: string;
  changeNotes: string;
}

export enum FileType {
  PDF = 'pdf',
  DOCX = 'docx',
  XLSX = 'xlsx',
  PPTX = 'pptx',
  JPG = 'jpg',
  PNG = 'png',
  TXT = 'txt',
}

// Folder types
export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
}

// Tag types
export interface Tag {
  id: string;
  name: string;
  color: string;
}

// User & Permission types
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export enum Role {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export enum AccessLevel {
  VIEW = 'view',
  EDIT = 'edit',
  DOWNLOAD = 'download',
  NONE = 'none',
}

// Annotation types
export interface Annotation {
  id: string;
  documentId: string;
  pageNumber: number;
  type: AnnotationType;
  content: string;
  position: {
    x: number;
    y: number;
  };
  createdBy: string;
  createdAt: Date;
}

export enum AnnotationType {
  HIGHLIGHT = 'highlight',
  COMMENT = 'comment',
  DRAWING = 'drawing',
}

// Search types
export interface SearchResult {
  documentId: string;
  matches: SearchMatch[];
}

export interface SearchMatch {
  text: string;
  pageNumber: number;
  position: {
    x: number;
    y: number;
  };
}