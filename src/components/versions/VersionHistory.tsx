import React, { useState } from 'react';
import { Clock, Upload } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { formatDate } from '../../utils/helpers';
import { Document } from '../../types';

interface VersionHistoryProps {
  document: Document;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({ document }) => {
  const { updateDocument } = useAppContext();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [changeNotes, setChangeNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleUploadNewVersion = () => {
    if (!selectedFile) return;
    
    // Create a new version
    const newVersion = {
      versionNumber: document.versions.length + 1,
      fileUrl: URL.createObjectURL(selectedFile),
      createdAt: new Date(),
      createdBy: 'user1',
      changeNotes: changeNotes || `Version ${document.versions.length + 1}`
    };
    
    // Update document with new version
    updateDocument(document.id, {
      versions: [...document.versions, newVersion],
      currentVersion: document.versions.length + 1,
      fileUrl: newVersion.fileUrl,
      updatedAt: new Date()
    });
    
    // Reset form
    setSelectedFile(null);
    setChangeNotes('');
    setUploadModalOpen(false);
  };
  
  const switchToVersion = (versionNumber: number) => {
    const version = document.versions.find(v => v.versionNumber === versionNumber);
    if (!version) return;
    
    updateDocument(document.id, {
      currentVersion: versionNumber,
      fileUrl: version.fileUrl
    });
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-gray-700">Version History</h4>
        <button
          onClick={() => setUploadModalOpen(true)}
          className="flex items-center text-xs px-2 py-1 bg-teal-600 text-white rounded hover:bg-teal-700"
        >
          <Upload className="h-3 w-3 mr-1" />
          New Version
        </button>
      </div>
      
      <div className="space-y-3">
        {document.versions.map((version, index) => (
          <div
            key={version.versionNumber}
            className={`p-3 border rounded-lg flex items-start ${
              version.versionNumber === document.currentVersion
                ? 'border-teal-300 bg-teal-50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
              <Clock className="h-4 w-4 text-gray-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <h5 className="text-sm font-medium text-gray-800">
                  Version {version.versionNumber}
                  {version.versionNumber === document.currentVersion && (
                    <span className="ml-2 text-xs bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </h5>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(version.createdAt)}
              </p>
              {version.changeNotes && (
                <p className="text-xs text-gray-600 mt-1">{version.changeNotes}</p>
              )}
            </div>
            {version.versionNumber !== document.currentVersion && (
              <button
                onClick={() => switchToVersion(version.versionNumber)}
                className="text-xs text-teal-600 hover:text-teal-800"
              >
                View
              </button>
            )}
          </div>
        ))}
      </div>
      
      {/* Upload new version modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-800">Upload New Version</h3>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {selectedFile ? (
                    <div className="text-sm">
                      <p className="font-medium text-gray-800">{selectedFile.name}</p>
                      <p className="text-gray-500 mt-1">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                  ) : (
                    <div>
                      <div className="mx-auto w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                        <Upload className="h-5 w-5 text-gray-500" />
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        Drag and drop a file or{' '}
                        <label className="text-teal-600 hover:text-teal-500 cursor-pointer">
                          browse
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                        </label>
                      </p>
                      <p className="text-xs text-gray-500">
                        Must be the same file type as the original document
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="changeNotes" className="block text-sm font-medium text-gray-700 mb-1">
                  Change Notes (Optional)
                </label>
                <textarea
                  id="changeNotes"
                  value={changeNotes}
                  onChange={(e) => setChangeNotes(e.target.value)}
                  placeholder="Describe what changed in this version"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadNewVersion}
                  disabled={!selectedFile}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    selectedFile
                      ? 'bg-teal-600 text-white hover:bg-teal-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};