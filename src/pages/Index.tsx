
import React, { useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import DocumentGrid from '@/components/documents/DocumentGrid';
import DocumentList from '@/components/documents/DocumentList';
import FileUpload from '@/components/upload/FileUpload';
import FolderManagement from '@/components/folders/FolderManagement';
import DocumentViewer from '@/components/viewer/DocumentViewer';
import { useDocumentStore } from '@/store/document-store';
import { Toaster } from '@/components/ui/sonner';

const Index = () => {
  const { viewMode, addFolder, addDocument } = useDocumentStore();
  
  // Initialize demo data
  useEffect(() => {
    const initializeDemoData = async () => {
      const store = useDocumentStore.getState();
      
      // Only initialize if there are no folders or documents
      if (store.folders.length === 0 && store.documents.length === 0) {
        // Add some demo folders
        addFolder('Work Documents', null);
        addFolder('Personal', null);
        
        try {
          // Create a simple PDF
          const content = `
            DocuPrism Demo Document
            
            This is a sample document used to demonstrate the document management capabilities
            of the DocuPrism system. This document can be searched, annotated, and shared.
            
            Features demonstrated:
            - Document viewing
            - Annotation
            - Search functionality
            - Version history
            - Access control
            
            To search for content, use the search bar at the top of the document viewer.
            Try searching for keywords like "sample", "document", or "annotation".
            
            You can add annotations by clicking the "Annotate" button in the toolbar.
          `;
          
          const blob = new Blob([content], { type: 'application/pdf' });
          const file = new File([blob], 'Sample Document.pdf', { type: 'application/pdf' });
          
          // Add the sample document
          await addDocument(file, { 
            name: 'Sample Document', 
            tags: ['tag-1', 'tag-3'],
            folderId: null
          });
        } catch (error) {
          console.error('Error creating demo documents:', error);
        }
      }
    };
    
    initializeDemoData();
  }, [addFolder, addDocument]);
  
  return (
    <>
      <MainLayout>
        {viewMode === 'grid' ? <DocumentGrid /> : <DocumentList />}
      </MainLayout>
      
      <FileUpload />
      <FolderManagement />
      <DocumentViewer />
      <Toaster richColors position="top-right" />
    </>
  );
};

export default Index;
