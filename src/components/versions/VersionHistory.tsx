
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { formatFileSize } from '@/utils/document-utils';
import { useDocumentStore } from '@/store/document-store';
import { DocumentVersion } from '@/types';
import { FileText, Download } from 'lucide-react';

interface VersionHistoryProps {
  documentId: string;
  onSelectVersion: (version: DocumentVersion) => void;
  selectedVersionId?: string;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({ 
  documentId, 
  onSelectVersion,
  selectedVersionId
}) => {
  const { documents } = useDocumentStore();
  const documentFile = documents.find(doc => doc.id === documentId);
  
  if (!documentFile) {
    return <div>Document not found</div>;
  }
  
  // Sort versions by version number (descending)
  const sortedVersions = [...documentFile.versions].sort((a, b) => 
    b.versionNumber - a.versionNumber
  );
  
  const handleVersionClick = (version: DocumentVersion) => {
    onSelectVersion(version);
  };
  
  const handleDownload = (e: React.MouseEvent, version: DocumentVersion) => {
    e.stopPropagation();
    
    const link = window.document.createElement('a');
    link.href = version.url;
    link.download = `${documentFile.name}_v${version.versionNumber}`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium">Version History</h3>
        <p className="text-sm text-muted-foreground">
          {documentFile.versions.length} version{documentFile.versions.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sortedVersions.map(version => (
            <div 
              key={version.id}
              className={`p-3 rounded-md cursor-pointer flex items-center ${
                version.id === selectedVersionId 
                  ? 'bg-accent text-accent-foreground' 
                  : 'hover:bg-accent/50'
              }`}
              onClick={() => handleVersionClick(version)}
            >
              <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between">
                  <span className="font-medium">Version {version.versionNumber}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(version.size)}
                  </span>
                </div>
                
                <div className="text-xs text-muted-foreground truncate">
                  {new Date(version.createdAt).toLocaleString()}
                </div>
              </div>
              
              <Button
                size="icon"
                variant="ghost"
                className="ml-2 h-8 w-8 opacity-70 hover:opacity-100"
                onClick={(e) => handleDownload(e, version)}
              >
                <Download className="h-4 w-4" />
                <span className="sr-only">Download</span>
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default VersionHistory;
