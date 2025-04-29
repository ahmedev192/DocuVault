import React from 'react';
import { FileText, FileSpreadsheet, Presentation as FilePresentation, Image, File } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { formatDate } from '../../utils/helpers';
import { FileType } from '../../types';

export const SearchResults: React.FC = () => {
  const { searchResults, setActiveDocument } = useAppContext();
  
  if (searchResults.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No documents found
      </div>
    );
  }
  
  const getIconByFileType = (fileType: FileType) => {
    switch (fileType) {
      case FileType.PDF:
        return <FileText className="h-4 w-4 text-red-500" />;
      case FileType.DOCX:
        return <FileText className="h-4 w-4 text-blue-500" />;
      case FileType.XLSX:
        return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
      case FileType.PPTX:
        return <FilePresentation className="h-4 w-4 text-orange-500" />;
      case FileType.JPG:
      case FileType.PNG:
        return <Image className="h-4 w-4 text-purple-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="py-2 max-h-64 overflow-y-auto">
      {searchResults.map(doc => (
        <div
          key={doc.id}
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          onClick={() => setActiveDocument(doc.id)}
        >
          <div className="flex items-center">
            <div className="mr-3">
              {getIconByFileType(doc.fileType)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{doc.title}</p>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <span className="truncate">{doc.description}</span>
                <span className="mx-1">•</span>
                <span>{formatDate(doc.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};