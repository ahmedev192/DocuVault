
import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useDocumentStore } from '@/store/document-store';
import { validateFileType, validateFileSize } from '@/utils/document-utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

const FileUpload = () => {
  const { isUploadModalOpen, toggleUploadModal, addDocument, folders, tags, selectedFolder } = useDocumentStore();
  
  const [file, setFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [folderId, setFolderId] = useState<string | null>(selectedFolder);
  const [isUploading, setIsUploading] = useState(false);
  
  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isUploadModalOpen) {
      setFolderId(selectedFolder);
    } else {
      resetForm();
    }
  }, [isUploadModalOpen, selectedFolder]);
  
  const resetForm = () => {
    setFile(null);
    setDocumentName('');
    setSelectedTags([]);
    setFolderId(null);
    setIsUploading(false);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      const typeValidation = validateFileType(selectedFile);
      if (!typeValidation.valid) {
        toast.error(typeValidation.message);
        return;
      }
      
      // Validate file size
      const sizeValidation = validateFileSize(selectedFile);
      if (!sizeValidation.valid) {
        toast.error(sizeValidation.message);
        return;
      }
      
      setFile(selectedFile);
      
      // Set document name from file name, without extension
      const nameWithoutExt = selectedFile.name.split('.').slice(0, -1).join('.');
      setDocumentName(nameWithoutExt || selectedFile.name);
    }
  };
  
  const handleTagSelect = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };
  
  const handleSubmit = async () => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }
    
    try {
      setIsUploading(true);
      
      await addDocument(file, {
        name: documentName || file.name,
        tags: selectedTags,
        folderId
      });
      
      toggleUploadModal(false);
      resetForm();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error uploading file');
    } finally {
      setIsUploading(false);
    }
  };
  
  const removeTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter(id => id !== tagId));
  };
  
  return (
    <Dialog open={isUploadModalOpen} onOpenChange={toggleUploadModal}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="file">File</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="name">Document Name</Label>
            <Input
              id="name"
              placeholder="Enter document name"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="folder">Folder</Label>
            <Select 
              value={folderId || ''}
              onValueChange={(value) => setFolderId(value === '' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select folder (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No folder</SelectItem>
                {folders.map(folder => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <Label>Tags</Label>
            <ScrollArea className="h-20 border rounded-md p-2">
              <div className="flex flex-wrap gap-1">
                {tags.map(tag => (
                  <Badge 
                    key={tag.id} 
                    style={{ 
                      backgroundColor: selectedTags.includes(tag.id) ? tag.color : 'transparent',
                      color: selectedTags.includes(tag.id) ? 'white' : 'inherit',
                      borderColor: tag.color,
                      borderWidth: '1px',
                      cursor: 'pointer'
                    }}
                    className="cursor-pointer"
                    onClick={() => handleTagSelect(tag.id)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
            
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                <Label className="mb-1">Selected Tags:</Label>
                <div className="flex flex-wrap gap-1">
                  {selectedTags.map(tagId => {
                    const tag = tags.find(t => t.id === tagId);
                    return tag ? (
                      <Badge 
                        key={tagId}
                        style={{ backgroundColor: tag.color }}
                        className="flex items-center"
                      >
                        {tag.name}
                        <X 
                          size={14} 
                          className="ml-1 cursor-pointer" 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTag(tagId);
                          }}
                        />
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => toggleUploadModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!file || isUploading}>
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FileUpload;
