import React, { useState } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { formatDate } from '../../utils/helpers';

interface AnnotationSidebarProps {
  documentId: string;
  pageNumber: number;
}

export const AnnotationSidebar: React.FC<AnnotationSidebarProps> = ({ documentId, pageNumber }) => {
  const { annotations, addAnnotation, removeAnnotation, currentUser } = useAppContext();
  const [newAnnotationText, setNewAnnotationText] = useState('');
  
  // Filter annotations for current document and page
  const currentAnnotations = annotations.filter(
    a => a.documentId === documentId && a.pageNumber === pageNumber
  );

  const handleAddAnnotation = () => {
    if (!newAnnotationText.trim()) return;
    
    addAnnotation({
      documentId,
      pageNumber,
      type: 'comment',
      content: newAnnotationText,
      position: { x: 300, y: 300 }, // Default position in the middle of the document
      createdBy: currentUser?.id || '',
      createdAt: new Date()
    });
    
    setNewAnnotationText('');
  };

  return (
    <div className="p-4">
      {currentAnnotations.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 mb-3">No annotations on this page</p>
          <p className="text-xs text-gray-400">Click anywhere on the document to add an annotation</p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentAnnotations.map(annotation => (
            <div key={annotation.id} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 mr-2">
                    {currentUser?.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{currentUser?.name}</p>
                    <p className="text-xs text-gray-500">{formatDate(annotation.createdAt)}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeAnnotation(annotation.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-gray-700 mt-2">
                {annotation.content || (
                  <span className="text-gray-400 italic">No content</span>
                )}
              </p>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Add new annotation</h4>
        <textarea
          value={newAnnotationText}
          onChange={(e) => setNewAnnotationText(e.target.value)}
          placeholder="Type your annotation here..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
          rows={3}
        ></textarea>
        <div className="flex justify-end mt-2">
          <button
            onClick={handleAddAnnotation}
            disabled={!newAnnotationText.trim()}
            className={`flex items-center px-3 py-1.5 rounded-md text-sm ${
              newAnnotationText.trim()
                ? 'bg-teal-600 text-white hover:bg-teal-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};