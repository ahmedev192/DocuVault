import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Document, Folder, User, Role, Tag, Annotation, AccessLevel } from '../types';
import { generateUniqueId } from '../utils/helpers';

interface AppContextType {
  // Documents
  documents: Document[];
  addDocument: (document: Omit<Document, 'id'>) => Document;
  updateDocument: (id: string, updates: Partial<Document>) => Document | null;
  deleteDocument: (id: string) => boolean;
  getDocumentById: (id: string) => Document | undefined;
  
  // Folders
  folders: Folder[];
  activeFolder: string;
  setActiveFolder: (id: string) => void;
  addFolder: (folder: Omit<Folder, 'id'>) => Folder;
  updateFolder: (id: string, updates: Partial<Folder>) => Folder | null;
  deleteFolder: (id: string) => boolean;
  
  // Tags
  tags: Tag[];
  addTag: (tag: Omit<Tag, 'id'>) => Tag;
  removeTag: (id: string) => boolean;
  
  // Users & Permissions
  users: User[];
  currentUser: User | null;
  setAccessLevel: (documentId: string, userId: string, level: AccessLevel) => boolean;
  
  // Document Viewer
  activeDocument: string | null;
  setActiveDocument: (id: string | null) => void;
  activePage: number;
  setActivePage: (page: number) => void;
  
  // Annotations
  annotations: Annotation[];
  addAnnotation: (annotation: Omit<Annotation, 'id'>) => Annotation;
  removeAnnotation: (id: string) => boolean;
  
  // Search
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: Document[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // State initialization
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([{ id: 'root', name: 'Home', parentId: null }]);
  const [activeFolder, setActiveFolder] = useState<string>('root');
  const [tags, setTags] = useState<Tag[]>([]);
  const [users, setUsers] = useState<User[]>([
    { 
      id: 'user1', 
      name: 'Demo User', 
      email: 'demo@example.com', 
      role: Role.ADMIN 
    }
  ]);
  const [currentUser] = useState<User>(users[0]);
  const [activeDocument, setActiveDocument] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<number>(1);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Document[]>([]);

  // Document operations
  const addDocument = (document: Omit<Document, 'id'>): Document => {
    const newDocument = { ...document, id: generateUniqueId() };
    setDocuments(prev => [...prev, newDocument]);
    return newDocument;
  };

  const updateDocument = (id: string, updates: Partial<Document>): Document | null => {
    let updatedDoc: Document | null = null;
    setDocuments(prev => {
      const newDocs = prev.map(doc => {
        if (doc.id === id) {
          updatedDoc = { ...doc, ...updates };
          return updatedDoc;
        }
        return doc;
      });
      return newDocs;
    });
    return updatedDoc;
  };

  const deleteDocument = (id: string): boolean => {
    let found = false;
    setDocuments(prev => {
      found = prev.some(doc => doc.id === id);
      return prev.filter(doc => doc.id !== id);
    });
    return found;
  };

  const getDocumentById = (id: string): Document | undefined => {
    return documents.find(doc => doc.id === id);
  };

  // Folder operations
  const addFolder = (folder: Omit<Folder, 'id'>): Folder => {
    const newFolder = { ...folder, id: generateUniqueId() };
    setFolders(prev => [...prev, newFolder]);
    return newFolder;
  };

  const updateFolder = (id: string, updates: Partial<Folder>): Folder | null => {
    let updatedFolder: Folder | null = null;
    setFolders(prev => {
      const newFolders = prev.map(folder => {
        if (folder.id === id) {
          updatedFolder = { ...folder, ...updates };
          return updatedFolder;
        }
        return folder;
      });
      return newFolders;
    });
    return updatedFolder;
  };

  const deleteFolder = (id: string): boolean => {
    let found = false;
    setFolders(prev => {
      found = prev.some(folder => folder.id === id);
      return prev.filter(folder => folder.id !== id);
    });
    return found;
  };

  // Tag operations
  const addTag = (tag: Omit<Tag, 'id'>): Tag => {
    const newTag = { ...tag, id: generateUniqueId() };
    setTags(prev => [...prev, newTag]);
    return newTag;
  };

  const removeTag = (id: string): boolean => {
    let found = false;
    setTags(prev => {
      found = prev.some(tag => tag.id === id);
      return prev.filter(tag => tag.id !== id);
    });
    return found;
  };

  // Access control
  const setAccessLevel = (documentId: string, userId: string, level: AccessLevel): boolean => {
    let success = false;
    setDocuments(prev => {
      return prev.map(doc => {
        if (doc.id === documentId) {
          const updatedAccess = { ...doc.access, [userId]: level };
          success = true;
          return { ...doc, access: updatedAccess };
        }
        return doc;
      });
    });
    return success;
  };

  // Annotation operations
  const addAnnotation = (annotation: Omit<Annotation, 'id'>): Annotation => {
    const newAnnotation = { ...annotation, id: generateUniqueId() };
    setAnnotations(prev => [...prev, newAnnotation]);
    return newAnnotation;
  };

  const removeAnnotation = (id: string): boolean => {
    let found = false;
    setAnnotations(prev => {
      found = prev.some(annotation => annotation.id === id);
      return prev.filter(annotation => annotation.id !== id);
    });
    return found;
  };

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    const results = documents.filter(doc => 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    setSearchResults(results);
  }, [searchTerm, documents]);

  const contextValue: AppContextType = {
    documents,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocumentById,
    
    folders,
    activeFolder,
    setActiveFolder,
    addFolder,
    updateFolder,
    deleteFolder,
    
    tags,
    addTag,
    removeTag,
    
    users,
    currentUser,
    setAccessLevel,
    
    activeDocument,
    setActiveDocument,
    activePage,
    setActivePage,
    
    annotations,
    addAnnotation,
    removeAnnotation,
    
    searchTerm,
    setSearchTerm,
    searchResults,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};