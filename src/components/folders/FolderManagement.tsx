
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDocumentStore } from '@/store/document-store';

const FolderManagement = () => {
  const { isFolderModalOpen, toggleFolderModal, addFolder, folders, selectedFolder } = useDocumentStore();
  
  const [folderName, setFolderName] = useState('');
  const [parentFolder, setParentFolder] = useState<string | null>(null);
  
  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (!isFolderModalOpen) {
      resetForm();
    } else {
      setParentFolder(selectedFolder);
    }
  }, [isFolderModalOpen, selectedFolder]);
  
  const resetForm = () => {
    setFolderName('');
    setParentFolder(null);
  };
  
  const handleSubmit = () => {
    if (!folderName.trim()) {
      return;
    }
    
    addFolder(folderName.trim(), parentFolder);
    toggleFolderModal(false);
    resetForm();
  };
  
  return (
    <Dialog open={isFolderModalOpen} onOpenChange={toggleFolderModal}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="folderName">Folder Name</Label>
            <Input
              id="folderName"
              placeholder="Enter folder name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="parentFolder">Parent Folder (Optional)</Label>
            <Select 
              value={parentFolder || ''}
              onValueChange={(value) => setParentFolder(value === '' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Root level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Root level</SelectItem>
                {folders.map(folder => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => toggleFolderModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!folderName.trim()}>
            Create Folder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FolderManagement;
