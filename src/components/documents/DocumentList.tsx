
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { File, FileText, FileImage, Folder, MoreHorizontal } from 'lucide-react';
import { useDocumentStore } from '@/store/document-store';
import { formatFileSize, getFileIcon } from '@/utils/document-utils';
import { Document as DocumentType, Folder as FolderType } from '@/types';

const getIconComponent = (fileType: string) => {
  const iconType = getFileIcon(fileType);
  switch (iconType) {
    case 'pdf':
      return <FileText className="h-5 w-5 text-red-500" />;
    case 'word':
      return <FileText className="h-5 w-5 text-blue-500" />;
    case 'excel':
      return <FileText className="h-5 w-5 text-green-500" />;
    case 'powerpoint':
      return <FileText className="h-5 w-5 text-orange-500" />;
    case 'image':
      return <FileImage className="h-5 w-5 text-purple-500" />;
    default:
      return <File className="h-5 w-5 text-gray-500" />;
  }
};

const DocumentList = () => {
  const { 
    documents, 
    folders, 
    tags, 
    selectedFolder, 
    searchQuery,
    setSelectedDocument,
    setSelectedFolder,
    deleteDocument,
    deleteFolder
  } = useDocumentStore();
  
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
  
  const handleOpenDocument = (document: DocumentType) => {
    setSelectedDocument(document);
  };
  
  const handleOpenFolder = (folderId: string) => {
    setSelectedFolder(folderId);
  };
  
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
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[400px]">Name</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Last Modified</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subfolders.map(folder => (
            <TableRow 
              key={folder.id}
              className="cursor-pointer hover:bg-accent/50"
              onClick={() => handleOpenFolder(folder.id)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <Folder className="h-5 w-5 text-amber-500 mr-2" />
                  {folder.name}
                </div>
              </TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>{new Date(folder.updatedAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        deleteFolder(folder.id);
                      }}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
          
          {filteredDocuments.map(document => (
            <TableRow 
              key={document.id}
              className="cursor-pointer hover:bg-accent/50"
              onClick={() => handleOpenDocument(document)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center">
                  {getIconComponent(document.type)}
                  <span className="ml-2">{document.name}</span>
                </div>
              </TableCell>
              <TableCell>{formatFileSize(document.size)}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {document.tags.slice(0, 2).map(tagId => {
                    const tag = tags.find(t => t.id === tagId);
                    return tag ? (
                      <Badge 
                        key={tagId} 
                        className="truncate max-w-[100px]"
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                      </Badge>
                    ) : null;
                  })}
                  {document.tags.length > 2 && (
                    <Badge variant="outline" className="truncate">
                      +{document.tags.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>{new Date(document.updatedAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        deleteDocument(document.id);
                      }}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DocumentList;
