import React, { useState } from 'react';
import { Upload, FolderPlus } from 'lucide-react';
import { UploadModal } from './UploadModal';
import { CreateFolderModal } from '../folders/CreateFolderModal';

export const EmptyState: React.FC = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);

  return (
    <>
      <div className="text-center py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="h-8 w-8 text-teal-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
          <p className="text-gray-500 mb-8">
            Upload your first document or create a folder to get started with organizing your files.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </button>
            <button
              onClick={() => setIsCreateFolderOpen(true)}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              Create Folder
            </button>
          </div>
        </div>
      </div>
      
      {isUploadModalOpen && <UploadModal onClose={() => setIsUploadModalOpen(false)} />}
      {isCreateFolderOpen && <CreateFolderModal onClose={() => setIsCreateFolderOpen(false)} />}
    </>
  );
};