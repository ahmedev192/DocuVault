
import { create } from 'zustand';
import { Document, Folder, Tag, User, ViewMode, AccessControl, Annotation } from '@/types';
import { generateId, readFileAsText } from '@/utils/document-utils';
import { toast } from 'sonner';

interface DocumentState {
  documents: Document[];
  folders: Folder[];
  tags: Tag[];
  users: User[];
  currentUser: User;
  selectedDocument: Document | null;
  selectedFolder: string | null;
  searchQuery: string;
  viewMode: ViewMode;
  isUploadModalOpen: boolean;
  isFolderModalOpen: boolean;
  isShareModalOpen: boolean;
  isAnnotationModalOpen: boolean;

  // Document actions
  addDocument: (file: File, metadata: { name?: string; tags?: string[]; folderId?: string | null }) => Promise<Document>;
  deleteDocument: (id: string) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  setSelectedDocument: (doc: Document | null) => void;
  addDocumentVersion: (documentId: string, file: File) => Promise<void>;

  // Folder actions
  addFolder: (name: string, parentId: string | null) => void;
  deleteFolder: (id: string) => void;
  updateFolder: (id: string, name: string) => void;
  setSelectedFolder: (folderId: string | null) => void;

  // Tag actions
  addTag: (name: string, color: string) => void;
  deleteTag: (id: string) => void;
  
  // Search and filtering
  setSearchQuery: (query: string) => void;

  // UI state actions
  setViewMode: (mode: ViewMode) => void;
  toggleUploadModal: (isOpen?: boolean) => void;
  toggleFolderModal: (isOpen?: boolean) => void;
  toggleShareModal: (isOpen?: boolean) => void;
  toggleAnnotationModal: (isOpen?: boolean) => void;
  
  // Access control
  updateDocumentAccess: (documentId: string, userId: string, permissionLevel: AccessControl['permissionLevel']) => void;
  
  // Annotations
  addAnnotation: (documentId: string, annotation: Omit<Annotation, 'id' | 'documentId' | 'createdBy' | 'createdAt'>) => void;
  deleteAnnotation: (documentId: string, annotationId: string) => void;
}

const demoUser: User = {
  id: 'user-1',
  name: 'Demo User',
  avatar: 'https://i.pravatar.cc/150?u=user-1',
};

const demoUsers: User[] = [
  demoUser,
  { id: 'user-2', name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?u=user-2' },
  { id: 'user-3', name: 'Bob Johnson', avatar: 'https://i.pravatar.cc/150?u=user-3' },
];

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  folders: [],
  tags: [
    { id: 'tag-1', name: 'Important', color: '#ef4444' },
    { id: 'tag-2', name: 'Work', color: '#3b82f6' },
    { id: 'tag-3', name: 'Personal', color: '#22c55e' },
  ],
  users: demoUsers,
  currentUser: demoUser,
  selectedDocument: null,
  selectedFolder: null,
  searchQuery: '',
  viewMode: 'grid',
  isUploadModalOpen: false,
  isFolderModalOpen: false,
  isShareModalOpen: false,
  isAnnotationModalOpen: false,

  // Document actions
  addDocument: async (file, metadata) => {
    try {
      const fileContent = file.type === 'application/pdf' || file.type.includes('text') 
        ? await readFileAsText(file) 
        : '';
      
      const newDoc: Document = {
        id: generateId(),
        name: metadata.name || file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        content: fileContent,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: metadata.tags || [],
        folderId: metadata.folderId || null,
        ownerId: get().currentUser.id,
        accessList: [
          { 
            userId: get().currentUser.id, 
            userName: get().currentUser.name, 
            permissionLevel: 'admin' 
          }
        ],
        versions: [
          {
            id: generateId(),
            documentId: '', // Will be filled after document creation
            versionNumber: 1,
            url: URL.createObjectURL(file),
            createdAt: new Date(),
            createdBy: get().currentUser.id,
            size: file.size,
          }
        ],
        annotations: [],
      };
      
      // Update the document ID in the version
      newDoc.versions[0].documentId = newDoc.id;
      
      set(state => ({
        documents: [...state.documents, newDoc]
      }));
      
      toast.success(`Document "${newDoc.name}" added successfully`);
      return newDoc;
    } catch (error) {
      console.error('Error adding document:', error);
      toast.error('Failed to add document');
      throw error;
    }
  },
  
  deleteDocument: (id) => {
    set(state => ({
      documents: state.documents.filter(doc => doc.id !== id)
    }));
    toast.success('Document deleted successfully');
  },
  
  updateDocument: (id, updates) => {
    set(state => ({
      documents: state.documents.map(doc => 
        doc.id === id ? { ...doc, ...updates, updatedAt: new Date() } : doc
      )
    }));
  },
  
  setSelectedDocument: (doc) => {
    set({ selectedDocument: doc });
  },
  
  addDocumentVersion: async (documentId, file) => {
    try {
      const document = get().documents.find(doc => doc.id === documentId);
      if (!document) {
        throw new Error('Document not found');
      }
      
      const highestVersion = Math.max(...document.versions.map(v => v.versionNumber), 0);
      
      const newVersion = {
        id: generateId(),
        documentId,
        versionNumber: highestVersion + 1,
        url: URL.createObjectURL(file),
        createdAt: new Date(),
        createdBy: get().currentUser.id,
        size: file.size,
      };
      
      // Also update document content for searchability if it's a PDF or text file
      let updatedContent = document.content;
      if (file.type === 'application/pdf' || file.type.includes('text')) {
        try {
          updatedContent = await readFileAsText(file);
        } catch (error) {
          console.error('Error reading file content:', error);
        }
      }
      
      set(state => ({
        documents: state.documents.map(doc => 
          doc.id === documentId 
            ? { 
                ...doc, 
                versions: [...doc.versions, newVersion], 
                url: URL.createObjectURL(file),
                content: updatedContent,
                updatedAt: new Date()
              } 
            : doc
        )
      }));
      
      toast.success(`New version (v${highestVersion + 1}) added successfully`);
    } catch (error) {
      console.error('Error adding document version:', error);
      toast.error('Failed to add new version');
      throw error;
    }
  },
  
  // Folder actions
  addFolder: (name, parentId) => {
    const newFolder: Folder = {
      id: generateId(),
      name,
      parentId,
      createdAt: new Date(),
      updatedAt: new Date(),
      ownerId: get().currentUser.id,
    };
    
    set(state => ({
      folders: [...state.folders, newFolder]
    }));
    
    toast.success(`Folder "${name}" created successfully`);
  },
  
  deleteFolder: (id) => {
    // Find any subfolders that need to be deleted as well
    const foldersToDelete = [id];
    const findSubfolders = (folderId: string) => {
      const subfolders = get().folders.filter(f => f.parentId === folderId).map(f => f.id);
      if (subfolders.length > 0) {
        foldersToDelete.push(...subfolders);
        subfolders.forEach(findSubfolders);
      }
    };
    findSubfolders(id);
    
    set(state => ({
      folders: state.folders.filter(f => !foldersToDelete.includes(f.id)),
      documents: state.documents.map(doc => 
        doc.folderId && foldersToDelete.includes(doc.folderId) 
          ? { ...doc, folderId: null } 
          : doc
      )
    }));
    
    toast.success('Folder deleted successfully');
  },
  
  updateFolder: (id, name) => {
    set(state => ({
      folders: state.folders.map(folder => 
        folder.id === id 
          ? { ...folder, name, updatedAt: new Date() } 
          : folder
      )
    }));
    
    toast.success(`Folder renamed to "${name}"`);
  },
  
  setSelectedFolder: (folderId) => {
    set({ selectedFolder: folderId });
  },
  
  // Tag actions
  addTag: (name, color) => {
    const newTag = {
      id: generateId(),
      name,
      color,
    };
    
    set(state => ({
      tags: [...state.tags, newTag]
    }));
  },
  
  deleteTag: (id) => {
    set(state => ({
      tags: state.tags.filter(tag => tag.id !== id),
      documents: state.documents.map(doc => ({
        ...doc,
        tags: doc.tags.filter(tagId => tagId !== id)
      }))
    }));
  },
  
  // Search and filtering
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },
  
  // UI state actions
  setViewMode: (mode) => {
    set({ viewMode: mode });
  },
  
  toggleUploadModal: (isOpen) => {
    set(state => ({ isUploadModalOpen: isOpen ?? !state.isUploadModalOpen }));
  },
  
  toggleFolderModal: (isOpen) => {
    set(state => ({ isFolderModalOpen: isOpen ?? !state.isFolderModalOpen }));
  },
  
  toggleShareModal: (isOpen) => {
    set(state => ({ isShareModalOpen: isOpen ?? !state.isShareModalOpen }));
  },
  
  toggleAnnotationModal: (isOpen) => {
    set(state => ({ isAnnotationModalOpen: isOpen ?? !state.isAnnotationModalOpen }));
  },
  
  // Access control
  updateDocumentAccess: (documentId, userId, permissionLevel) => {
    set(state => ({
      documents: state.documents.map(doc => {
        if (doc.id !== documentId) return doc;
        
        // Check if user already has access
        const existingAccess = doc.accessList.findIndex(entry => entry.userId === userId);
        let updatedAccessList;
        
        if (existingAccess >= 0) {
          // Update existing access
          updatedAccessList = [...doc.accessList];
          updatedAccessList[existingAccess] = {
            ...updatedAccessList[existingAccess],
            permissionLevel
          };
        } else {
          // Add new access
          const user = state.users.find(u => u.id === userId);
          if (!user) return doc;
          
          updatedAccessList = [
            ...doc.accessList,
            {
              userId,
              userName: user.name,
              permissionLevel
            }
          ];
        }
        
        return {
          ...doc,
          accessList: updatedAccessList,
          updatedAt: new Date()
        };
      })
    }));
    
    const userName = get().users.find(u => u.id === userId)?.name || 'User';
    toast.success(`Permission updated for ${userName}`);
  },
  
  // Annotations
  addAnnotation: (documentId, annotation) => {
    const newAnnotation: Annotation = {
      id: generateId(),
      documentId,
      createdBy: get().currentUser.id,
      createdAt: new Date(),
      ...annotation,
    };
    
    set(state => ({
      documents: state.documents.map(doc => 
        doc.id === documentId 
          ? { 
              ...doc, 
              annotations: [...doc.annotations, newAnnotation],
              updatedAt: new Date()
            } 
          : doc
      )
    }));
    
    toast.success('Annotation added successfully');
  },
  
  deleteAnnotation: (documentId, annotationId) => {
    set(state => ({
      documents: state.documents.map(doc => 
        doc.id === documentId 
          ? { 
              ...doc, 
              annotations: doc.annotations.filter(a => a.id !== annotationId),
              updatedAt: new Date()
            } 
          : doc
      )
    }));
    
    toast.success('Annotation deleted successfully');
  }
}));
