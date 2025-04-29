import React, { useState, useRef, ChangeEvent } from 'react';
import { X, Upload, Plus, Trash2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { 
  isAllowedFileType, isAllowedFileSize, formatFileSize, 
  getFileExtension, extensionToFileType 
} from '../../utils/helpers';
import { FileType } from '../../types';

interface UploadModalProps {
  onClose: () => void;
}

interface FileWithPreview {
  file: File;
  preview: string | null;
  progress: number;
  error: string | null;
}

export const UploadModal: React.FC<UploadModalProps> = ({ onClose }) => {
  const { addDocument, folders, activeFolder } = useAppContext();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(activeFolder);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const allowedFileTypes = ['pdf', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'jpg', 'jpeg', 'png', 'txt'];
  const maxFileSize = 50 * 1024 * 1024; // 50MB
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };
  
  const handleFiles = (fileList: FileList) => {
    const newFiles: FileWithPreview[] = [];
    
    Array.from(fileList).forEach(file => {
      // Validate file type
      if (!isAllowedFileType(file.name, allowedFileTypes)) {
        newFiles.push({
          file,
          preview: null,
          progress: 0,
          error: 'Unsupported file type'
        });
        return;
      }
      
      // Validate file size
      if (!isAllowedFileSize(file.size, maxFileSize)) {
        newFiles.push({
          file,
          preview: null,
          progress: 0,
          error: 'File size exceeds 50MB'
        });
        return;
      }
      
      // Create preview for image files
      let preview = null;
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
      }
      
      newFiles.push({
        file,
        preview,
        progress: 0,
        error: null
      });
    });
    
    setFiles(prev => [...prev, ...newFiles]);
    
    // Set title from first file if title is empty
    if (!title && newFiles.length > 0 && !newFiles[0].error) {
      setTitle(newFiles[0].file.name.split('.').slice(0, -1).join('.'));
    }
  };
  
  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      
      // Revoke object URL if it exists
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      
      newFiles.splice(index, 1);
      return newFiles;
    });
  };
  
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }
    
    if (files.length === 0 || files.some(f => f.error)) {
      alert('Please upload valid files');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Simulate upload progress
      const updatedFiles = [...files];
      
      for (let i = 0; i < updatedFiles.length; i++) {
        if (updatedFiles[i].error) continue;
        
        // Simulate progress updates
        for (let progress = 0; progress <= 100; progress += 10) {
          updatedFiles[i].progress = progress;
          setFiles([...updatedFiles]);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Create tag objects
        const tagObjects = tags.map((tagName, index) => ({
          id: `tag-${index}`,
          name: tagName,
          color: ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'indigo'][index % 7]
        }));
        
        // Add document to context
        const file = updatedFiles[i].file;
        const fileExtension = getFileExtension(file.name);
        const fileType = extensionToFileType(fileExtension) as FileType;
        
        addDocument({
          title: files.length === 1 ? title : file.name.split('.').slice(0, -1).join('.'),
          description,
          fileUrl: URL.createObjectURL(file),
          fileType,
          fileSize: file.size,
          folderId: selectedFolder,
          tags: tagObjects,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user1',
          versions: [
            {
              versionNumber: 1,
              fileUrl: URL.createObjectURL(file),
              createdAt: new Date(),
              createdBy: 'user1',
              changeNotes: 'Initial upload'
            }
          ],
          currentVersion: 1,
          totalPages: Math.floor(Math.random() * 30) + 1, // Random page count for demo
          access: { 'user1': 'edit' }
        });
      }
      
      onClose();
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('An error occurred during upload');
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Upload Documents</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            disabled={isUploading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          <div className="p-4">
            {/* File upload area */}
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4 text-center"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {files.length === 0 ? (
                <div>
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Drag and drop files here, or{' '}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-teal-600 hover:text-teal-500 font-medium"
                    >
                      browse
                    </button>
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Supported file types: PDF, Word, Excel, PowerPoint, Images
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.txt"
                    disabled={isUploading}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {files.map((fileObj, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center p-3 border rounded-lg ${
                        fileObj.error ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex-shrink-0 mr-3">
                        {fileObj.preview ? (
                          <img src={fileObj.preview} alt="Preview" className="w-10 h-10 object-cover rounded" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-500">
                              {getFileExtension(fileObj.file.name).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {fileObj.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(fileObj.file.size)}
                        </p>
                        {fileObj.error && (
                          <p className="text-xs text-red-600 mt-1">{fileObj.error}</p>
                        )}
                        {!fileObj.error && fileObj.progress > 0 && (
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div
                              className="bg-teal-600 h-1.5 rounded-full"
                              style={{ width: `${fileObj.progress}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                        disabled={isUploading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center text-sm text-teal-600 hover:text-teal-500 mt-2"
                    disabled={isUploading}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add more files
                  </button>
                </div>
              )}
            </div>
            
            {/* Document details */}
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Document title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  disabled={isUploading}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  disabled={isUploading}
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="folder" className="block text-sm font-medium text-gray-700 mb-1">
                  Folder
                </label>
                <select
                  id="folder"
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  disabled={isUploading}
                >
                  {folders.map(folder => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (Optional)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1.5 inline-flex items-center justify-center text-teal-400 hover:text-teal-600"
                        disabled={isUploading}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add a tag"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    disabled={isUploading}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 bg-teal-600 text-white rounded-r-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    disabled={isUploading || !tagInput.trim()}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 inline-flex items-center"
              disabled={isUploading || files.length === 0}
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};