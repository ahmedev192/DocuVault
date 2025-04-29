import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { DocumentCard } from './DocumentCard';
import { Folder, Plus } from 'lucide-react';
import { generateBreadcrumbs } from '../../utils/helpers';
import { EmptyState } from './EmptyState';
import { Document } from '../../types';

export const DocumentGrid: React.FC = () => {
  const { documents, folders, activeFolder, setActiveFolder } = useAppContext();
  
  // Filter documents for current folder
  const folderDocuments = documents.filter(doc => doc.folderId === activeFolder);
  
  // Get breadcrumbs
  const breadcrumbs = generateBreadcrumbs(folders, activeFolder);
  
  // Get subfolders of current folder
  const subfolders = folders.filter(folder => folder.parentId === activeFolder);
  
  const navigateToFolder = (folderId: string) => {
    setActiveFolder(folderId);
  };

  return (
    <div>
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 mb-6 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.id}>
            {index > 0 && <span className="text-gray-400">/</span>}
            <button
              onClick={() => navigateToFolder(crumb.id)}
              className={`hover:text-teal-600 ${
                index === breadcrumbs.length - 1
                  ? 'font-medium text-gray-800'
                  : 'text-gray-600'
              }`}
            >
              {crumb.name}
            </button>
          </React.Fragment>
        ))}
      </div>
      
      {/* Folder and document count */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {folders.find(f => f.id === activeFolder)?.name || 'Documents'}
        </h2>
        <div className="text-sm text-gray-600">
          {subfolders.length} folder{subfolders.length !== 1 ? 's' : ''}, {folderDocuments.length} document{folderDocuments.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      {subfolders.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Folders</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {subfolders.map(folder => (
              <div
                key={folder.id}
                onClick={() => navigateToFolder(folder.id)}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-teal-500 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center mr-3">
                    <Folder className="h-5 w-5 text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-800 truncate">{folder.name}</h4>
                    <p className="text-xs text-gray-500">
                      {documents.filter(doc => doc.folderId === folder.id).length} document{documents.filter(doc => doc.folderId === folder.id).length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Add folder card */}
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4 hover:border-teal-500 hover:bg-gray-100 transition-all cursor-pointer flex items-center justify-center">
              <div className="text-center">
                <div className="mx-auto w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center mb-2">
                  <Plus className="h-5 w-5 text-teal-600" />
                </div>
                <p className="text-sm font-medium text-gray-600">Add Folder</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Documents section */}
      {folderDocuments.length > 0 ? (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">Documents</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {folderDocuments.map(document => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </div>
        </div>
      ) : subfolders.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="mt-8 text-center py-12">
          <p className="text-gray-500">No documents in this folder</p>
        </div>
      )}
    </div>
  );
};