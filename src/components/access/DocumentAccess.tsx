
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDocumentStore } from '@/store/document-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { AccessControl } from '@/types';

interface DocumentAccessProps {
  documentId: string;
}

const DocumentAccess: React.FC<DocumentAccessProps> = ({ documentId }) => {
  const { documents, users, currentUser, isShareModalOpen, toggleShareModal, updateDocumentAccess } = useDocumentStore();
  const document = documents.find(doc => doc.id === documentId);
  
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedPermission, setSelectedPermission] = useState<AccessControl['permissionLevel']>('view');
  
  if (!document) return null;

  // Get users who don't have access yet
  const availableUsers = users.filter(
    user => !document.accessList.some(access => access.userId === user.id)
  );
  
  const handleAddAccess = () => {
    if (!selectedUserId) return;
    
    updateDocumentAccess(documentId, selectedUserId, selectedPermission);
    setSelectedUserId('');
  };
  
  const handleUpdateAccess = (userId: string, permission: AccessControl['permissionLevel']) => {
    updateDocumentAccess(documentId, userId, permission);
  };
  
  const getPermissionBadge = (permission: AccessControl['permissionLevel']) => {
    switch (permission) {
      case 'view':
        return <Badge className="bg-blue-500">View</Badge>;
      case 'edit':
        return <Badge className="bg-green-500">Edit</Badge>;
      case 'download':
        return <Badge className="bg-purple-500">Download</Badge>;
      case 'admin':
        return <Badge className="bg-red-500">Admin</Badge>;
      default:
        return <Badge>{permission}</Badge>;
    }
  };
  
  return (
    <Dialog open={isShareModalOpen} onOpenChange={toggleShareModal}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Document</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <h3 className="text-sm font-medium mb-2">
            People with access
          </h3>
          
          <ScrollArea className="h-48 border rounded-md p-2 mb-4">
            {document.accessList.map(access => (
              <div key={access.userId} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-2">
                    {access.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium">
                      {access.userName}
                      {access.userId === currentUser.id ? ' (You)' : ''}
                    </div>
                  </div>
                </div>
                
                <div>
                  {access.userId === document.ownerId ? (
                    <Badge className="bg-amber-500">Owner</Badge>
                  ) : (
                    <Select
                      value={access.permissionLevel}
                      onValueChange={(value) => handleUpdateAccess(
                        access.userId, 
                        value as AccessControl['permissionLevel']
                      )}
                      disabled={access.userId === currentUser.id}
                    >
                      <SelectTrigger className="w-24 h-8">
                        <SelectValue>{getPermissionBadge(access.permissionLevel)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="view">View</SelectItem>
                        <SelectItem value="edit">Edit</SelectItem>
                        <SelectItem value="download">Download</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            ))}
          </ScrollArea>
          
          {availableUsers.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Add people</h3>
              <div className="flex space-x-2">
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedPermission} onValueChange={(value) => setSelectedPermission(value as AccessControl['permissionLevel'])}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View</SelectItem>
                    <SelectItem value="edit">Edit</SelectItem>
                    <SelectItem value="download">Download</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button onClick={handleAddAccess} disabled={!selectedUserId}>
                  Add
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentAccess;
