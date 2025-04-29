import React, { useState } from 'react';
import { FileText, Image, FileSpreadsheet, Presentation as FilePresentation, File, MoreVertical, Users, Download, Trash2, Edit, Eye } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { formatDate, formatFileSize, getTagColor } from '../../utils/helpers';
import { Document, AccessLevel, FileType } from '../../types';
import { ShareModal } from './ShareModal';

interface DocumentCardProps {
  document: Document;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
  const { setActiveDocument, deleteDocument } = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  const handleViewDocument = () => {
    setActiveDocument(document.id);
  };

  const getIconByFileType = (fileType: FileType) => {
    switch (fileType) {
      case FileType.PDF:
        return <FileText className="h-6 w-6 text-red-500" />;
      case FileType.DOCX:
        return <FileText className="h-6 w-6 text-blue-500" />;
      case FileType.XLSX:
        return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
      case FileType.PPTX:
        return <FilePresentation className="h-6 w-6 text-orange-500" />;
      case FileType.JPG:
      case FileType.PNG:
        return <Image className="h-6 w-6 text-purple-500" />;
      default:
        return <File className="h-6 w-6 text-gray-500" />;
    }
  };
  
  const handleDeleteDocument = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this document?')) {
      deleteDocument(document.id);
    }
    setIsMenuOpen(false);
  };
  
  const handleShareDocument = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShareModalOpen(true);
    setIsMenuOpen(false);
  };

  return (
    <>
      <div 
        className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer group"
        onClick={handleViewDocument}
      >
        {/* Card header with icon and menu */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center">
            {getIconByFileType(document.fileType)}
            <span className="ml-2 text-xs font-medium uppercase text-gray-500">
              {document.fileType}
            </span>
          </div>
          
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 z-10 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                <div className="py-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={handleViewDocument}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Eye className="h-4 w-4 mr-3" />
                    View
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Download className="h-4 w-4 mr-3" />
                    Download
                  </button>
                  <button
                    onClick={handleShareDocument}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Users className="h-4 w-4 mr-3" />
                    Share
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Edit className="h-4 w-4 mr-3" />
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteDocument}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <Trash2 className="h-4 w-4 mr-3" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Document content */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-800 mb-1 truncate" title={document.title}>
            {document.title}
          </h3>
          <p className="text-xs text-gray-500 mb-3 line-clamp-2" title={document.description}>
            {document.description}
          </p>
          
          {/* Tags */}
          {document.tags && document.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {document.tags.slice(0, 3).map((tag) => {
                const { bg, text } = getTagColor(tag.color);
                return (
                  <span
                    key={tag.id}
                    className={`text-xs px-2 py-0.5 rounded-full ${bg} ${text}`}
                  >
                    {tag.name}
                  </span>
                );
              })}
              {document.tags.length > 3 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  +{document.tags.length - 3}
                </span>
              )}
            </div>
          )}
          
          {/* File info */}
          <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
            <span>{formatFileSize(document.fileSize)}</span>
            <span>{formatDate(document.updatedAt)}</span>
          </div>
        </div>
      </div>
      
      {isShareModalOpen && (
        <ShareModal document={document} onClose={() => setIsShareModalOpen(false)} />
      )}
    </>
  );
};