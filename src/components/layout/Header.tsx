import React, { useState } from 'react';
import { Search, User, Bell, Upload, Plus } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { UploadModal } from '../documents/UploadModal';
import { SearchResults } from '../search/SearchResults';

export const Header: React.FC = () => {
  const { searchTerm, setSearchTerm, currentUser, activeDocument } = useAppContext();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center">
          {!activeDocument && (
            <h1 className="text-xl font-semibold text-gray-800 hidden md:block">Document Manager</h1>
          )}
        </div>
        
        <div className="relative flex items-center flex-1 mx-6 md:mx-10">
          <div className="relative w-full max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            />
            {isSearchFocused && searchTerm.trim() !== '' && (
              <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-md mt-1 z-10">
                <SearchResults />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 text-white bg-teal-600 hover:bg-teal-700 rounded-md px-3 py-2 transition-colors"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Upload className="h-4 w-4" />
            <span className="hidden md:inline">Upload</span>
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
              <User className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-gray-700 hidden md:block">{currentUser?.name}</span>
          </div>
        </div>
      </header>
      
      {isUploadModalOpen && (
        <UploadModal onClose={() => setIsUploadModalOpen(false)} />
      )}
    </>
  );
};