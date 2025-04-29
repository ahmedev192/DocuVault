import React, { useState } from 'react';
import { 
  File, FolderPlus, Tag, Users, Settings, ChevronDown, 
  ChevronRight, Folder, PlusCircle
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { generateBreadcrumbs } from '../../utils/helpers';
import { CreateFolderModal } from '../folders/CreateFolderModal';

export const Sidebar: React.FC = () => {
  const { folders, activeFolder, setActiveFolder, documents } = useAppContext();
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['root']);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => 
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const renderFolderTree = (parentId: string | null, level = 0) => {
    const subfolders = folders.filter(folder => folder.parentId === parentId);
    
    if (subfolders.length === 0) {
      return null;
    }
    
    return (
      <ul className={`${level > 0 ? 'ml-4' : ''}`}>
        {subfolders.map(folder => {
          const hasChildren = folders.some(f => f.parentId === folder.id);
          const isExpanded = expandedFolders.includes(folder.id);
          const isActive = activeFolder === folder.id;
          const documentCount = documents.filter(doc => doc.folderId === folder.id).length;
          
          return (
            <li key={folder.id} className="mb-1">
              <div 
                className={`flex items-center py-1 px-2 rounded-md cursor-pointer ${
                  isActive ? 'bg-teal-100 text-teal-700' : 'hover:bg-gray-100'
                }`}
              >
                <button
                  onClick={() => hasChildren && toggleFolder(folder.id)}
                  className="mr-1 focus:outline-none"
                >
                  {hasChildren ? (
                    isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )
                  ) : (
                    <span className="w-4"></span>
                  )}
                </button>
                
                <Folder className={`h-4 w-4 mr-2 ${isActive ? 'text-teal-600' : 'text-gray-500'}`} />
                
                <button
                  onClick={() => setActiveFolder(folder.id)}
                  className="flex-1 text-left text-sm focus:outline-none truncate"
                >
                  {folder.name}
                </button>
                
                {documentCount > 0 && (
                  <span className="text-xs bg-gray-200 rounded-full px-2 py-0.5 ml-2">
                    {documentCount}
                  </span>
                )}
              </div>
              
              {isExpanded && renderFolderTree(folder.id, level + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <>
      <aside className="w-64 border-r border-gray-200 bg-white h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">DocuVault</h1>
          <p className="text-xs text-gray-500 mt-1">Secure Document Management</p>
        </div>
        
        <div className="flex flex-col justify-between flex-1 overflow-y-auto">
          <nav className="p-4">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Folders</h2>
                <button 
                  onClick={() => setIsCreateFolderOpen(true)}
                  className="text-gray-500 hover:text-teal-600"
                >
                  <PlusCircle className="h-4 w-4" />
                </button>
              </div>
              {renderFolderTree(null)}
            </div>
            
            <div className="space-y-1">
              <button className="flex items-center w-full py-2 px-3 rounded-md hover:bg-gray-100">
                <Tag className="h-4 w-4 mr-3 text-gray-500" />
                <span className="text-sm">Tags</span>
              </button>
              
              <button className="flex items-center w-full py-2 px-3 rounded-md hover:bg-gray-100">
                <Users className="h-4 w-4 mr-3 text-gray-500" />
                <span className="text-sm">Shared with me</span>
              </button>
              
              <button className="flex items-center w-full py-2 px-3 rounded-md hover:bg-gray-100">
                <Settings className="h-4 w-4 mr-3 text-gray-500" />
                <span className="text-sm">Settings</span>
              </button>
            </div>
          </nav>
          
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Storage</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-teal-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">3GB of 10GB used</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
      
      {isCreateFolderOpen && (
        <CreateFolderModal onClose={() => setIsCreateFolderOpen(false)} />
      )}
    </>
  );
};