import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Document as ReactPdfDocument, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useDocumentStore } from '@/store/document-store';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { searchInDocumentContent, highlightSearchTerms } from '@/utils/document-utils';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up the worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

// Add styles for highlighted text
const searchHighlightStyle = `
  .search-highlight {
    background-color: rgba(255, 255, 0, 0.5);
    border-radius: 2px;
    padding: 0 2px;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  }
`;

interface PdfViewerProps {
  url: string;
  documentId: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ url, documentId }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [keyword, setKeyword] = useState<string>('');
  const [searchHighlights, setSearchHighlights] = useState<number[]>([]);
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState<number>(-1);
  const [isAnnotationDialogOpen, setIsAnnotationDialogOpen] = useState(false);
  const [annotationContent, setAnnotationContent] = useState('');
  const [annotationType, setAnnotationType] = useState<'highlight' | 'comment'>('comment');
  const [pdfText, setPdfText] = useState<{[key: number]: string}>({});
  
  const pageRef = useRef<HTMLDivElement>(null);
  
  const { selectedDocument, addAnnotation } = useDocumentStore();

  useEffect(() => {
    // Reset viewer state when document changes
    setPageNumber(1);
    setScale(1.0);
    setKeyword('');
    setSearchHighlights([]);
    setCurrentHighlightIndex(-1);
    setPdfText({});
  }, [documentId]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    // Extract text from all pages when document loads successfully
    extractTextFromPdf(numPages);
  };

  const extractTextFromPdf = async (numPages: number) => {
    if (!url) return;
    
    try {
      const loadingTask = pdfjs.getDocument(url);
      const pdf = await loadingTask.promise;
      
      const textContent: {[key: number]: string} = {};
      
      // Extract text from each page
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text = content.items.map((item: any) => item.str).join(' ');
        textContent[i] = text;
      }
      
      setPdfText(textContent);
      console.log('PDF text extracted successfully');
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= (numPages || 1)) {
      setPageNumber(page);
    }
  };

  const handlePageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      goToPage(value);
    }
  };

  const handlePrevPage = () => {
    goToPage(pageNumber - 1);
  };

  const handleNextPage = () => {
    goToPage(pageNumber + 1);
  };

  const handleZoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.1, 2.5));
  };

  const handleZoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.1, 0.5));
  };

  const handleZoomChange = (value: number[]) => {
    setScale(value[0]);
  };

  const handleDownload = () => {
    if (!selectedDocument) return;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedDocument.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSearch = async () => {
    if (!keyword.trim()) {
      setSearchHighlights([]);
      setCurrentHighlightIndex(-1);
      return;
    }
    
    // Search in the extracted text from the PDF
    const results: number[] = [];
    const searchTerm = keyword.toLowerCase();
    
    // Search through all pages
    Object.entries(pdfText).forEach(([pageNum, text]) => {
      if (text.toLowerCase().includes(searchTerm)) {
        results.push(parseInt(pageNum));
      }
    });
    
    if (results.length > 0) {
      setSearchHighlights(results);
      setCurrentHighlightIndex(0);
      // Navigate to the first page with a match
      goToPage(results[0]);
      toast.success(`Found matches on ${results.length} ${results.length === 1 ? 'page' : 'pages'}`);
    } else {
      setSearchHighlights([]);
      setCurrentHighlightIndex(-1);
      toast.error('No matches found');
    }
  };

  const handleSearchNext = () => {
    if (searchHighlights.length > 0) {
      const nextIndex = (currentHighlightIndex + 1) % searchHighlights.length;
      setCurrentHighlightIndex(nextIndex);
      
      // Navigate to the page containing the next highlight
      goToPage(searchHighlights[nextIndex]);
    }
  };

  const handleSearchPrev = () => {
    if (searchHighlights.length > 0) {
      const prevIndex = (currentHighlightIndex - 1 + searchHighlights.length) % searchHighlights.length;
      setCurrentHighlightIndex(prevIndex);
      
      // Navigate to the page containing the previous highlight
      goToPage(searchHighlights[prevIndex]);
    }
  };

  const handleAddAnnotation = () => {
    if (!annotationContent.trim()) {
      toast.error('Please enter some content for your annotation');
      return;
    }
    
    addAnnotation(documentId, {
      type: annotationType,
      content: annotationContent,
      position: {
        page: pageNumber,
        x: 100,  // In a real app, this would be the clicked position
        y: 100,
      }
    });
    
    setIsAnnotationDialogOpen(false);
    setAnnotationContent('');
  };

  // Render annotations for the current page
  const renderAnnotations = () => {
    if (!selectedDocument) return null;
    
    const pageAnnotations = selectedDocument.annotations.filter(
      annotation => annotation.position?.page === pageNumber
    );
    
    if (pageAnnotations.length === 0) return null;
    
    return (
      <div className="absolute left-0 right-0 bottom-0 bg-background/80 p-3 border-t">
        <h4 className="text-sm font-medium mb-2">Annotations ({pageAnnotations.length})</h4>
        <div className="space-y-2 max-h-32 overflow-auto">
          {pageAnnotations.map((annotation) => (
            <div 
              key={annotation.id} 
              className="text-sm p-2 border rounded bg-muted/50"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 text-xs rounded ${
                  annotation.type === 'highlight' 
                    ? 'bg-yellow-200 text-yellow-800' 
                    : 'bg-blue-200 text-blue-800'
                }`}>
                  {annotation.type}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(annotation.createdAt).toLocaleString()}
                </span>
              </div>
              <p>{annotation.content}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const onKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Apply highlighting to text layer when page renders
  const handlePageRendered = useCallback(() => {
    if (keyword && pageRef.current) {
      // Wait for the text layer to be fully rendered
      setTimeout(() => {
        const textLayer = pageRef.current?.querySelector('.react-pdf__Page__textContent');
        if (textLayer instanceof HTMLElement) {
          highlightSearchTerms(textLayer, keyword);
        }
      }, 500);
    }
  }, [keyword, pageNumber]);

  return (
    <div className="flex flex-col h-full">
      {/* Add style for search highlighting - with !important to ensure it works */}
      <style>{`
        ${searchHighlightStyle}
        .search-highlight {
          background-color: rgba(255, 255, 0, 0.6) !important;
          color: black !important;
          border-radius: 2px !important;
          padding: 0 2px !important;
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1) !important;
          display: inline !important;
        }
      `}</style>
      
      {/* Toolbar */}
      <div className="bg-muted/30 border-b p-2 flex flex-wrap gap-2 items-center">
        <div className="flex items-center space-x-1">
          <Button 
            size="icon" 
            variant="outline" 
            onClick={handlePrevPage}
            disabled={pageNumber <= 1}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
              <path d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
            </svg>
          </Button>
          
          <div className="flex items-center min-w-[100px]">
            <Input
              className="w-12 h-8 p-1 text-center"
              value={pageNumber}
              onChange={handlePageChange}
            />
            <span className="mx-1 text-sm text-muted-foreground whitespace-nowrap">
              / {numPages || '-'}
            </span>
          </div>
          
          <Button 
            size="icon" 
            variant="outline" 
            onClick={handleNextPage}
            disabled={pageNumber >= (numPages || 1)}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
              <path d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64949 10.6151 7.84182L6.86514 11.8418C6.67627 12.0433 6.35985 12.0535 6.1584 11.8646C5.95694 11.6757 5.94673 11.3593 6.1356 11.1579L9.565 7.49985L6.1356 3.84182C5.94673 3.64036 5.95694 3.32394 6.1584 3.13508Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
            </svg>
          </Button>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button 
            size="icon" 
            variant="outline" 
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
              <path d="M2.25 7.5C2.25 7.22386 2.47386 7 2.75 7H12.25C12.5261 7 12.75 7.22386 12.75 7.5C12.75 7.77614 12.5261 8 12.25 8H2.75C2.47386 8 2.25 7.77614 2.25 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
            </svg>
          </Button>
          
          <Slider 
            className="w-28" 
            min={0.5} 
            max={2.5} 
            step={0.1} 
            value={[scale]}
            onValueChange={handleZoomChange}
          />
          
          <Button 
            size="icon" 
            variant="outline" 
            onClick={handleZoomIn}
            disabled={scale >= 2.5}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
              <path d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
            </svg>
          </Button>
          
          <span className="text-xs text-muted-foreground">
            {Math.round(scale * 100)}%
          </span>
        </div>
        
        <div className="flex items-center ml-auto space-x-1">
          <div className="flex items-center border rounded-md overflow-hidden">
            <Input
              className="h-8 border-0 min-w-[120px]"
              placeholder="Search..."
              value={keyword}
              onChange={onKeywordChange}
              onKeyDown={onKeyDown}
            />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSearch}
              className="h-8 px-2"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                <path d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.30884 10.0159C8.53901 10.6318 7.56251 11 6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5C11 7.56251 10.6318 8.53901 10.0159 9.30884L12.8536 12.1464C13.0488 12.3417 13.0488 12.6583 12.8536 12.8536C12.6583 13.0488 12.3417 13.0488 12.1464 12.8536L9.30884 10.0159Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
              </svg>
            </Button>
          </div>
          
          {searchHighlights.length > 0 && (
            <div className="flex items-center space-x-1">
              <Button
                size="icon"
                variant="outline"
                onClick={handleSearchPrev}
                className="h-8 w-8"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                  <path d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </Button>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {currentHighlightIndex + 1} of {searchHighlights.length}
              </span>
              <Button
                size="icon"
                variant="outline"
                onClick={handleSearchNext}
                className="h-8 w-8"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                  <path d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64949 10.6151 7.84182L6.86514 11.8418C6.67627 12.0433 6.35985 12.0535 6.1584 11.8646C5.95694 11.6757 5.94673 11.3593 6.1356 11.1579L9.565 7.49985L6.1356 3.84182C5.94673 3.64036 5.95694 3.32394 6.1584 3.13508Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </Button>
            </div>
          )}
          
          <Button
            size="sm"
            variant="outline"
            className="ml-2"
            onClick={handleDownload}
          >
            Download
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAnnotationDialogOpen(true)}
          >
            Annotate
          </Button>
        </div>
      </div>
      
      {/* PDF Document Viewer */}
      <div className="flex-1 overflow-auto relative">
        <div className="flex justify-center p-4 min-h-full" ref={pageRef}>
          <ReactPdfDocument
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            className="w-full"
            error={<div className="text-center my-8">Failed to load PDF document</div>}
            loading={<div className="text-center my-8">Loading document...</div>}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderAnnotationLayer
              renderTextLayer
              onRenderSuccess={handlePageRendered}
            />
          </ReactPdfDocument>
        </div>
        
        {/* Annotations overlay */}
        {renderAnnotations()}
      </div>
      
      {/* Annotation Dialog */}
      <Dialog open={isAnnotationDialogOpen} onOpenChange={setIsAnnotationDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Annotation</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="comment">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger 
                value="comment"
                onClick={() => setAnnotationType('comment')}
              >
                Comment
              </TabsTrigger>
              <TabsTrigger 
                value="highlight"
                onClick={() => setAnnotationType('highlight')}
              >
                Highlight
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="comment" className="mt-0">
              <Textarea
                placeholder="Enter your comment..."
                value={annotationContent}
                onChange={(e) => setAnnotationContent(e.target.value)}
                className="min-h-[120px]"
              />
            </TabsContent>
            
            <TabsContent value="highlight" className="mt-0">
              <Textarea
                placeholder="Enter your highlight note..."
                value={annotationContent}
                onChange={(e) => setAnnotationContent(e.target.value)}
                className="min-h-[120px]"
              />
              <p className="text-sm text-muted-foreground mt-2">
                In a real application, you would be able to select text in the document to highlight.
              </p>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAnnotationDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAnnotation}>
              Add Annotation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PdfViewer;
