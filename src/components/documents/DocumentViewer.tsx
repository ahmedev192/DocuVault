import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, X, Download, Users, Tag,
  Clock, MessageSquare, PlusCircle, Trash2, Eye 
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { formatDate, formatFileSize } from '../../utils/helpers';
import { ShareModal } from './ShareModal';
import { AnnotationSidebar } from '../annotations/AnnotationSidebar';
import { VersionHistory } from '../versions/VersionHistory';

export const DocumentViewer: React.FC = () => {
  const { 
    documents, activeDocument, setActiveDocument, 
    activePage, setActivePage, annotations, addAnnotation
  } = useAppContext();
  
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarContent, setSidebarContent] = useState<'annotations' | 'versions' | 'info'>('annotations');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  const document = documents.find(doc => doc.id === activeDocument);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [showControls]);
  
  if (!document) {
    return null;
  }
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= document.totalPages) {
      setActivePage(newPage);
    }
  };
  
  const handleAnnotationClick = (e: React.MouseEvent) => {
    // In a real implementation, this would get the position relative to the document
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    addAnnotation({
      documentId: document.id,
      pageNumber: activePage,
      type: 'comment',
      content: '',
      position: { x, y },
      createdBy: 'user1',
      createdAt: new Date()
    });
    
    setShowSidebar(true);
    setSidebarContent('annotations');
  };
  
  const handleClose = () => {
    setActiveDocument(null);
    setActivePage(1);
  };
  
  // Document annotations for current page
  const currentPageAnnotations = annotations.filter(
    a => a.documentId === document.id && a.pageNumber === activePage
  );

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex">
      {/* Main content */}
      <div 
        className="flex-1 flex flex-col overflow-hidden"
        onMouseMove={() => setShowControls(true)}
      >
        {/* Toolbar */}
        <div 
          className={`bg-gray-800 text-white transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center">
              <button 
                onClick={handleClose}
                className="p-1 hover:bg-gray-700 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="ml-3 font-medium truncate max-w-md">{document.title}</h2>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                className="p-2 hover:bg-gray-700 rounded-md text-sm flex items-center"
                onClick={() => {
                  setShowSidebar(true);
                  setSidebarContent('annotations');
                }}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Annotations {currentPageAnnotations.length > 0 && `(${currentPageAnnotations.length})`}
              </button>
              
              <button 
                className="p-2 hover:bg-gray-700 rounded-md text-sm flex items-center"
                onClick={() => {
                  setShowSidebar(true);
                  setSidebarContent('versions');
                }}
              >
                <Clock className="h-4 w-4 mr-1" />
                Versions
              </button>
              
              <button 
                className="p-2 hover:bg-gray-700 rounded-md text-sm flex items-center"
                onClick={() => {
                  setShowSidebar(true);
                  setSidebarContent('info');
                }}
              >
                <Eye className="h-4 w-4 mr-1" />
                Details
              </button>
              
              <button 
                className="p-2 hover:bg-gray-700 rounded-md text-sm flex items-center"
                onClick={() => setIsShareModalOpen(true)}
              >
                <Users className="h-4 w-4 mr-1" />
                Share
              </button>
              
              <button className="p-2 hover:bg-gray-700 rounded-md text-sm flex items-center">
                <Download className="h-4 w-4 mr-1" />
                Download
              </button>
            </div>
          </div>
        </div>
        
        {/* Document viewer */}
        <div className="flex-1 overflow-auto bg-gray-700 flex items-center justify-center">
          <div 
            className="relative shadow-lg max-w-3xl mx-auto bg-white h-[80vh] aspect-[3/4]"
            onClick={handleAnnotationClick}
          >
            {/* This would be the actual document in a real implementation */}
            <div className="absolute inset-0 flex items-center justify-center text-gray-300">
              {document.fileType === 'pdf' && (
                <div className="w-full h-full p-8 flex flex-col">
                  <h1 className="text-3xl font-bold text-black mb-6">{document.title}</h1>
                  <p className="text-gray-800 mb-4">
                    This is page {activePage} of the document. In a real implementation, 
                    this would show the actual PDF content.
                  </p>
                  <p className="text-gray-600 mb-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                    incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
                    exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                  <p className="text-gray-600 mb-4">
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu 
                    fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in 
                    culpa qui officia deserunt mollit anim id est laborum.
                  </p>
                </div>
              )}
              
              {document.fileType === 'docx' && (
                <div className="w-full h-full p-8 flex flex-col">
                  <h1 className="text-3xl font-bold text-black mb-6">{document.title}</h1>
                  <p className="text-gray-800 mb-4">
                    This is a Word document. In a real implementation, this would render the 
                    actual document content.
                  </p>
                </div>
              )}
              
              {(document.fileType === 'jpg' || document.fileType === 'png') && (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-gray-800">Image preview would be shown here</p>
                </div>
              )}
            </div>
            
            {/* Annotation markers */}
            {currentPageAnnotations.map(annotation => (
              <div
                key={annotation.id}
                className="absolute w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform"
                style={{ left: `${annotation.position.x}px`, top: `${annotation.position.y}px` }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSidebar(true);
                  setSidebarContent('annotations');
                }}
              >
                <MessageSquare className="h-3 w-3 text-yellow-800" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Page controls */}
        <div 
          className={`bg-gray-800 text-white flex items-center justify-between px-4 py-2 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex-1"></div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handlePageChange(activePage - 1)}
              disabled={activePage <= 1}
              className={`p-1 rounded-full ${
                activePage <= 1 ? 'text-gray-500' : 'hover:bg-gray-700'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <span className="text-sm">
              Page {activePage} of {document.totalPages}
            </span>
            
            <button
              onClick={() => handlePageChange(activePage + 1)}
              disabled={activePage >= document.totalPages}
              className={`p-1 rounded-full ${
                activePage >= document.totalPages ? 'text-gray-500' : 'hover:bg-gray-700'
              }`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1"></div>
        </div>
      </div>
      
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-72 bg-white border-l border-gray-200 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-800">
              {sidebarContent === 'annotations' && 'Annotations'}
              {sidebarContent === 'versions' && 'Version History'}
              {sidebarContent === 'info' && 'Document Info'}
            </h3>
            <button
              onClick={() => setShowSidebar(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {sidebarContent === 'annotations' && (
              <AnnotationSidebar documentId={document.id} pageNumber={activePage} />
            )}
            
            {sidebarContent === 'versions' && (
              <VersionHistory document={document} />
            )}
            
            {sidebarContent === 'info' && (
              <div className="p-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Title</h4>
                    <p className="text-sm text-gray-800">{document.title}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Description</h4>
                    <p className="text-sm text-gray-800">
                      {document.description || 'No description provided'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">File Type</h4>
                    <p className="text-sm text-gray-800">{document.fileType.toUpperCase()}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Size</h4>
                    <p className="text-sm text-gray-800">{formatFileSize(document.fileSize)}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Created</h4>
                    <p className="text-sm text-gray-800">{formatDate(document.createdAt)}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Last Modified</h4>
                    <p className="text-sm text-gray-800">{formatDate(document.updatedAt)}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Tags</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {document.tags.map(tag => (
                        <span
                          key={tag.id}
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-${tag.color}-100 text-${tag.color}-800`}
                        >
                          {tag.name}
                        </span>
                      ))}
                      {document.tags.length === 0 && (
                        <p className="text-sm text-gray-500">No tags</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {isShareModalOpen && (
        <ShareModal document={document} onClose={() => setIsShareModalOpen(false)} />
      )}
    </div>
  );
};