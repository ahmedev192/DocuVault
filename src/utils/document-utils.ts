import { Document, DocumentVersion } from '@/types';

// File type validation
export const validateFileType = (file: File): { valid: boolean; message: string } => {
  const validTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
    'application/msword', // doc
    'application/vnd.ms-excel', // xls
    'application/vnd.ms-powerpoint', // ppt
    'text/plain', // txt
  ];
  
  if (!validTypes.includes(file.type)) {
    return { 
      valid: false, 
      message: 'Unsupported file type. Please upload PDF, Word, Excel, PowerPoint, or text documents.'
    };
  }
  
  return { valid: true, message: 'File type is valid' };
};

// File size validation (max 10MB)
export const validateFileSize = (file: File): { valid: boolean; message: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  
  if (file.size > maxSize) {
    return {
      valid: false,
      message: 'File size exceeds 10MB limit. Please upload a smaller file.'
    };
  }
  
  return { valid: true, message: 'File size is valid' };
};

// Generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return bytes + ' bytes';
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + ' KB';
  } else {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }
};

// Get file icon based on file type
export const getFileIcon = (fileType: string): string => {
  if (fileType.includes('pdf')) {
    return 'pdf';
  } else if (fileType.includes('word') || fileType.includes('document')) {
    return 'word';
  } else if (fileType.includes('sheet') || fileType.includes('excel')) {
    return 'excel';
  } else if (fileType.includes('presentation') || fileType.includes('powerpoint')) {
    return 'powerpoint';
  } else if (fileType.includes('text')) {
    return 'text';
  } else {
    return 'file';
  }
};

// Search in document content
export const searchInDocumentContent = (doc: Document, keyword: string): boolean => {
  if (!doc.content) return false;
  
  // Improved search functionality - case insensitive search
  const searchTerm = keyword.toLowerCase();
  const content = doc.content.toLowerCase();
  
  // Advanced search handling for tag prefix
  if (keyword.startsWith('tag:')) {
    const tagName = keyword.substring(4).toLowerCase().trim();
    const documentTags = doc.tags.map(tagId => {
      // Find the tag by ID and get its name
      // This would need the tags array from the store in a real implementation
      return tagId;
    });
    
    return documentTags.some(tagId => tagId.toLowerCase().includes(tagName));
  }
  
  return content.includes(searchTerm);
};

// Get latest document version
export const getLatestVersion = (versions: DocumentVersion[]): DocumentVersion | undefined => {
  if (versions.length === 0) return undefined;
  
  return versions.reduce((latest, current) => {
    return current.versionNumber > latest.versionNumber ? current : latest;
  }, versions[0]);
};

// Create a blob URL for file content
export const createBlobUrl = (content: string, type: string): string => {
  const blob = new Blob([content], { type });
  return URL.createObjectURL(blob);
};

// Read file content as text
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('Failed to read file content'));
      }
    };
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    reader.readAsText(file);
  });
};

// Create a downloadable link for a document
export const downloadDocument = (doc: Document): void => {
  const link = document.createElement('a');
  link.href = doc.url;
  link.download = doc.name;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Highlight text in PDF viewer - enhanced version
export const highlightSearchTerms = (textLayer: HTMLElement, searchTerm: string): void => {
  if (!searchTerm || !textLayer) return;
  
  const divs = textLayer.querySelectorAll('.textLayer > div');
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  divs.forEach(div => {
    const text = div.textContent || '';
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes(lowerSearchTerm)) {
      // Create a new HTML with the highlighted text
      const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
      const highlightedText = text.replace(
        regex,
        '<span class="search-highlight">$1</span>'
      );
      div.innerHTML = highlightedText;
    }
  });
};

// Helper function to escape special characters for regex
export const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
};
