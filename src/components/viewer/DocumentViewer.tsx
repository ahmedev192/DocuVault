
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDocumentStore } from '@/store/document-store';
import VersionHistory from '@/components/versions/VersionHistory';
import PdfViewer from '@/components/viewer/PdfViewer';
import DocumentAccess from '@/components/access/DocumentAccess';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Document as DocumentType, DocumentVersion } from '@/types';
import { X, Share, Upload } from 'lucide-react';
import { getLatestVersion } from '@/utils/document-utils';

const DocumentViewer = () => {
  const { 
    selectedDocument, 
    setSelectedDocument, 
    toggleShareModal,
    toggleUploadModal
  } = useDocumentStore();
  
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  
  if (!selectedDocument) {
    return null;
  }
  
  // Get the version to display
  const displayVersion = selectedVersion || getLatestVersion(selectedDocument.versions);
  
  const handleSelectVersion = (version: DocumentVersion) => {
    setSelectedVersion(version);
  };
  
  const handleUploadVersion = () => {
    toggleUploadModal(true);
  };
  
  return (
    <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
      <DialogContent className="max-w-6xl w-[95vw] h-[95vh]">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={80} minSize={50}>
            <div className="h-full flex flex-col">
              <div className="border-b p-3 flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold truncate">
                    {selectedDocument.name}
                  </h2>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="hidden md:flex"
                    onClick={() => toggleShareModal(true)}
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="hidden md:flex"
                    onClick={handleUploadVersion}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New Version
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setShowVersionHistory(!showVersionHistory)}
                    className={showVersionHistory ? 'bg-accent' : ''}
                  >
                    {showVersionHistory ? 'Hide' : 'Show'} Versions
                  </Button>
                  
                  <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={() => setSelectedDocument(null)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 overflow-hidden">
                {displayVersion && (
                  <PdfViewer url={displayVersion.url} documentId={selectedDocument.id} />
                )}
              </div>
            </div>
          </ResizablePanel>
          
          {showVersionHistory && (
            <>
              <ResizableHandle />
              <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                <VersionHistory 
                  documentId={selectedDocument.id} 
                  onSelectVersion={handleSelectVersion}
                  selectedVersionId={selectedVersion?.id}
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </DialogContent>
      
      <DocumentAccess documentId={selectedDocument.id} />
    </Dialog>
  );
};

export default DocumentViewer;
