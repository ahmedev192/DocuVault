import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

interface CreateFolderModalProps {
  onClose: () => void;
}

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({ onClose }) => {
  const { folders, addFolder, activeFolder } = useAppContext();
  const [folderName, setFolderName] = useState('');
  const [parentId, setParentId] = useState(activeFolder);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!folderName.trim()) {
      setError('Folder name is required');
      return;
    }
    
    // Check if folder with same name exists in the same parent
    const folderExists = folders.some(
      folder => folder.name.toLowerCase() === folderName.toLowerCase() && folder.parentId === parentId
    );
    
    if (folderExists) {
      setError('A folder with this name already exists');
      return;
    }
    
    addFolder({
      name: folderName,
      parentId,
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Create New Folder</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label htmlFor="folderName" className="block text-sm font-medium text-gray-700 mb-1">
              Folder Name
            </label>
            <input
              type="text"
              id="folderName"
              value={folderName}
              onChange={(e) => {
                setFolderName(e.target.value);
                setError('');
              }}
              placeholder="Enter folder name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              autoFocus
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
          
          <div className="mb-4">
            <label htmlFor="parentFolder" className="block text-sm font-medium text-gray-700 mb-1">
              Parent Folder
            </label>
            <select
              id="parentFolder"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {folders.map(folder => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              Create Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};