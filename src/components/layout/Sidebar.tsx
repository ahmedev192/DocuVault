
import React from 'react';
import { Folder, File, Plus, Settings, Search, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDocumentStore } from '@/store/document-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
  color?: string;
  indent?: number;
}

const SidebarItem = ({ icon, label, onClick, active = false, color, indent = 0 }: SidebarItemProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'w-full justify-start h-9 px-3 text-sm',
            active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground',
            `pl-${indent + 3}`
          )}
          onClick={onClick}
          style={{ paddingLeft: `${(indent * 8) + 12}px` }}
        >
          <div className="flex items-center w-full">
            <div className="mr-2">
              {icon}
            </div>
            <span className="truncate">{label}</span>
            {color && (
              <div 
                className="ml-auto w-3 h-3 rounded-full" 
                style={{ backgroundColor: color }}
              />
            )}
          </div>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">
        {label}
      </TooltipContent>
    </Tooltip>
  );
};

const Sidebar = () => {
  const { 
    toggleFolderModal, 
    toggleUploadModal, 
    folders,
    tags,
    selectedFolder,
    setSelectedFolder,
    setSearchQuery
  } = useDocumentStore();
  
  // Function to render folders recursively
  const renderFolders = (parentId: string | null, indent = 0) => {
    const filteredFolders = folders.filter(folder => folder.parentId === parentId);
    
    return filteredFolders.map(folder => (
      <React.Fragment key={folder.id}>
        <SidebarItem
          icon={<Folder size={16} />}
          label={folder.name}
          active={selectedFolder === folder.id}
          onClick={() => setSelectedFolder(folder.id)}
          indent={indent}
        />
        {renderFolders(folder.id, indent + 1)}
      </React.Fragment>
    ));
  };
  
  const handleAllDocuments = () => {
    setSelectedFolder(null);
    setSearchQuery('');
  };
  
  return (
    <div className="w-60 h-screen border-r flex flex-col bg-background">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">DocuPrism</h2>
        
        <div className="space-y-1 mb-4">
          <Button 
            variant="default" 
            className="w-full justify-start"
            onClick={() => toggleUploadModal(true)}
          >
            <Plus size={16} className="mr-2" />
            Upload Document
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start mt-2"
            onClick={() => toggleFolderModal(true)}
          >
            <Folder size={16} className="mr-2" />
            New Folder
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          <SidebarItem
            icon={<File size={16} />}
            label="All Documents"
            active={selectedFolder === null && !document.location.hash.includes('search')}
            onClick={handleAllDocuments}
          />
        
          <div className="mt-4 mb-2 px-3">
            <h3 className="text-xs font-medium text-muted-foreground">FOLDERS</h3>
          </div>
          
          {renderFolders(null)}
          
          <div className="mt-4 mb-2 px-3">
            <h3 className="text-xs font-medium text-muted-foreground">TAGS</h3>
          </div>
          
          {tags.map(tag => (
            <SidebarItem
              key={tag.id}
              icon={<Tag size={16} />}
              label={tag.name}
              color={tag.color}
              onClick={() => {
                setSearchQuery(`tag:${tag.name}`);
              }}
            />
          ))}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t">
        <SidebarItem
          icon={<Settings size={16} />}
          label="Settings"
          onClick={() => {}}
        />
      </div>
    </div>
  );
};

export default Sidebar;
