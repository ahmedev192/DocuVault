
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatFileSize, getFileIcon } from '@/utils/document-utils';
import { useDocumentStore } from '@/store/document-store';
import { Document as DocumentType } from '@/types';
import { File, FileText, FileImage, Folder } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const getIconComponent = (fileType: string) => {
  const iconType = getFileIcon(fileType);
  switch (iconType) {
    case 'pdf':
      return <FileText className="h-12 w-12 text-red-500" />;
    case 'word':
      return <FileText className="h-12 w-12 text-blue-500" />;
    case 'excel':
      return <FileText className="h-12 w-12 text-green-500" />;
    case 'powerpoint':
      return <FileText className="h-12 w-12 text-orange-500" />;
    case 'image':
      return <FileImage className="h-12 w-12 text-purple-500" />;
    default:
      return <File className="h-12 w-12 text-gray-500" />;
  }
};

interface DocumentCardProps {
  document: DocumentType;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
  const { setSelectedDocument, tags, deleteDocument } = useDocumentStore();
  
  const handleOpenDocument = () => {
    setSelectedDocument(document);
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteDocument(document.id);
  };
  
  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleOpenDocument}
    >
      <CardContent className="p-4 flex flex-col items-center justify-center">
        {getIconComponent(document.type)}
        <h3 className="mt-2 text-sm font-medium truncate w-full text-center">
          {document.name}
        </h3>
      </CardContent>
      
      <CardFooter className="flex flex-col items-start p-2 pt-0 gap-1">
        <div className="w-full flex flex-wrap gap-1">
          {document.tags.slice(0, 2).map(tagId => {
            const tag = tags.find(t => t.id === tagId);
            return tag ? (
              <Badge 
                key={tagId} 
                className="truncate max-w-full"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </Badge>
            ) : null;
          })}
          {document.tags.length > 2 && (
            <Badge variant="outline" className="truncate">
              +{document.tags.length - 2} more
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between w-full mt-1">
          <span className="text-xs text-muted-foreground">
            {formatFileSize(document.size)}
          </span>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <span className="sr-only">Open menu</span>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                  <path d="M3 7.5C3 6.67157 2.32843 6 1.5 6C0.671573 6 0 6.67157 0 7.5C0 8.32843 0.671573 9 1.5 9C2.32843 9 3 8.32843 3 7.5ZM8 7.5C8 6.67157 7.32843 6 6.5 6C5.67157 6 5 6.67157 5 7.5C5 8.32843 5.67157 9 6.5 9C7.32843 9 8 8.32843 8 7.5ZM13 7.5C13 6.67157 12.3284 6 11.5 6C10.6716 6 10 6.67157 10 7.5C10 8.32843 10.6716 9 11.5 9C12.3284 9 13 8.32843 13 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDelete}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  );
};

interface FolderCardProps {
  folder: { id: string; name: string };
}

const FolderCard: React.FC<FolderCardProps> = ({ folder }) => {
  const { setSelectedFolder, deleteFolder } = useDocumentStore();
  
  const handleOpenFolder = () => {
    setSelectedFolder(folder.id);
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteFolder(folder.id);
  };
  
  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow bg-muted/30"
      onClick={handleOpenFolder}
    >
      <CardContent className="p-4 flex flex-col items-center justify-center">
        <Folder className="h-12 w-12 text-amber-500" />
        <h3 className="mt-2 text-sm font-medium truncate w-full text-center">
          {folder.name}
        </h3>
      </CardContent>
      
      <CardFooter className="flex justify-end p-2 pt-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <span className="sr-only">Open menu</span>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                <path d="M3 7.5C3 6.67157 2.32843 6 1.5 6C0.671573 6 0 6.67157 0 7.5C0 8.32843 0.671573 9 1.5 9C2.32843 9 3 8.32843 3 7.5ZM8 7.5C8 6.67157 7.32843 6 6.5 6C5.67157 6 5 6.67157 5 7.5C5 8.32843 5.67157 9 6.5 9C7.32843 9 8 8.32843 8 7.5ZM13 7.5C13 6.67157 12.3284 6 11.5 6C10.6716 6 10 6.67157 10 7.5C10 8.32843 10.6716 9 11.5 9C12.3284 9 13 8.32843 13 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleDelete}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
};

const DocumentGrid = () => {
  const { documents, folders, tags, selectedFolder, searchQuery } = useDocumentStore();
  
  // Filter documents based on selected folder and search query
  const filteredDocuments = React.useMemo(() => {
    let result = documents;
    
    // Filter by folder
    if (selectedFolder !== null) {
      result = result.filter(doc => doc.folderId === selectedFolder);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      
      // Check if searching by tag
      if (query.startsWith('tag:')) {
        const tagName = query.substring(4).trim();
        const matchingTags = tags
          .filter(tag => tag.name.toLowerCase().includes(tagName))
          .map(tag => tag.id);
        
        result = result.filter(doc => 
          doc.tags.some(tagId => matchingTags.includes(tagId))
        );
      } else {
        // Search by name or content
        result = result.filter(doc =>
          doc.name.toLowerCase().includes(query) ||
          (doc.content && doc.content.toLowerCase().includes(query))
        );
      }
    }
    
    return result;
  }, [documents, selectedFolder, searchQuery, tags]);
  
  // Get the current folder's subfolders
  const subfolders = React.useMemo(() => {
    return folders.filter(folder => folder.parentId === selectedFolder);
  }, [folders, selectedFolder]);
  
  const currentFolder = selectedFolder ? folders.find(f => f.id === selectedFolder) : null;
  
  if (filteredDocuments.length === 0 && subfolders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <File className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">No documents found</h2>
        <p className="text-muted-foreground max-w-md">
          {searchQuery 
            ? `No documents matching "${searchQuery}" were found. Try different search terms.` 
            : `This ${currentFolder ? 'folder' : 'library'} is empty. Upload some documents to get started.`}
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4">
      {subfolders.map(folder => (
        <FolderCard key={folder.id} folder={folder} />
      ))}
      
      {filteredDocuments.map(document => (
        <DocumentCard key={document.id} document={document} />
      ))}
    </div>
  );
};

export default DocumentGrid;
