
import React from 'react';
import { useDocumentStore } from '@/store/document-store';
import Sidebar from '@/components/layout/Sidebar';
import SearchBar from '@/components/search/SearchBar';
import { Button } from '@/components/ui/button';
import { Grid, List, Upload, FolderPlus } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { 
    viewMode, 
    setViewMode,
    toggleUploadModal,
    toggleFolderModal,
    selectedFolder,
    folders
  } = useDocumentStore();
  
  const currentFolder = selectedFolder ? folders.find(f => f.id === selectedFolder) : null;
  const breadcrumbs = React.useMemo(() => {
    if (!selectedFolder) return [];
    
    const result = [];
    let current = currentFolder;
    
    while (current) {
      result.unshift(current);
      current = folders.find(f => f.id === current?.parentId) || null;
    }
    
    return result;
  }, [selectedFolder, currentFolder, folders]);
  
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1">
              <div className="mb-2">
                {breadcrumbs.length > 0 ? (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <button 
                      className="hover:underline"
                      onClick={() => {}}
                    >
                      Documents
                    </button>
                    
                    {breadcrumbs.map((folder, i) => (
                      <React.Fragment key={folder.id}>
                        <span className="mx-1">/</span>
                        <button 
                          className={i === breadcrumbs.length - 1 
                            ? "font-medium text-foreground" 
                            : "hover:underline"
                          }
                          onClick={() => {}}
                        >
                          {folder.name}
                        </button>
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                  <h1 className="text-xl font-semibold">All Documents</h1>
                )}
              </div>
              <SearchBar />
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center border rounded-md overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="px-3 h-9"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid size={18} />
                </Button>
                
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="px-3 h-9"
                  onClick={() => setViewMode('list')}
                >
                  <List size={18} />
                </Button>
              </div>
              
              <Button
                size="sm"
                variant="outline"
                className="hidden md:flex"
                onClick={() => toggleFolderModal(true)}
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                New Folder
              </Button>
              
              <Button
                size="sm"
                onClick={() => toggleUploadModal(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
