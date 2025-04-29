import React, { useState } from 'react';
import { X, Plus, Mail, Link } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Document, AccessLevel, User } from '../../types';

interface ShareModalProps {
  document: Document;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ document, onClose }) => {
  const { users, setAccessLevel } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleAccessChange = (userId: string, level: AccessLevel) => {
    setAccessLevel(document.id, userId, level);
  };
  
  const copyLink = () => {
    // In a real app, this would generate and copy a shareable link
    navigator.clipboard.writeText(`https://example.com/documents/${document.id}`);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };
  
  const getUserAccessLevel = (userId: string): AccessLevel => {
    return document.access[userId] as AccessLevel || AccessLevel.NONE;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Share Document</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">People with access</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-3">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <select
                    value={getUserAccessLevel(user.id)}
                    onChange={(e) => handleAccessChange(user.id, e.target.value as AccessLevel)}
                    className="text-sm border border-gray-300 rounded-md p-1 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value={AccessLevel.NONE}>No access</option>
                    <option value={AccessLevel.VIEW}>Can view</option>
                    <option value={AccessLevel.EDIT}>Can edit</option>
                    <option value={AccessLevel.DOWNLOAD}>Can download</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Add people</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowResults(e.target.value.length > 0);
                }}
                onFocus={() => searchTerm.length > 0 && setShowResults(true)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {showResults && searchTerm.length > 0 && (
                <div className="absolute left-0 right-0 bg-white border border-gray-300 rounded-md mt-1 shadow-lg z-10 max-h-40 overflow-y-auto">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <div
                        key={user.id}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          handleAccessChange(user.id, AccessLevel.VIEW);
                          setSearchTerm('');
                          setShowResults(false);
                        }}
                      >
                        <p className="text-sm font-medium text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-gray-500">No users found</div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Get link</label>
            <div className="flex gap-2">
              <div className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 bg-gray-50 text-gray-600 text-sm truncate">
                https://example.com/documents/{document.id.substring(0, 8)}
              </div>
              <button
                onClick={copyLink}
                className={`flex items-center px-3 py-2 rounded-r-md text-sm ${
                  linkCopied
                    ? 'bg-green-600 text-white'
                    : 'bg-teal-600 text-white hover:bg-teal-700'
                }`}
              >
                {linkCopied ? 'Copied!' : (
                  <>
                    <Link className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};