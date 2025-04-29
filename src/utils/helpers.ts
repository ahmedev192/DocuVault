// Generate unique ID
export const generateUniqueId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get file extension from filename
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
};

// Convert file extension to FileType
export const extensionToFileType = (extension: string) => {
  const mapping: Record<string, string> = {
    'pdf': 'pdf',
    'docx': 'docx',
    'doc': 'docx',
    'xlsx': 'xlsx',
    'xls': 'xlsx',
    'pptx': 'pptx',
    'ppt': 'pptx',
    'jpg': 'jpg',
    'jpeg': 'jpg',
    'png': 'png',
    'txt': 'txt',
  };
  
  return mapping[extension] || 'unknown';
};

// Validate file type
export const isAllowedFileType = (filename: string, allowedTypes: string[]): boolean => {
  const extension = getFileExtension(filename);
  return allowedTypes.includes(extension);
};

// Validate file size
export const isAllowedFileSize = (size: number, maxSize: number): boolean => {
  return size <= maxSize;
};

// Format date
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Get document icon based on file type
export const getDocumentIcon = (fileType: string): string => {
  const iconMapping: Record<string, string> = {
    'pdf': 'file-text',
    'docx': 'file-text',
    'xlsx': 'file-spreadsheet',
    'pptx': 'file-presentation',
    'jpg': 'image',
    'png': 'image',
    'txt': 'file',
  };
  
  return iconMapping[fileType] || 'file';
};

// Get color for tag
export const getTagColor = (color: string): { bg: string; text: string } => {
  const colorMap: Record<string, { bg: string; text: string }> = {
    'red': { bg: 'bg-red-100', text: 'text-red-800' },
    'blue': { bg: 'bg-blue-100', text: 'text-blue-800' },
    'green': { bg: 'bg-green-100', text: 'text-green-800' },
    'yellow': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    'purple': { bg: 'bg-purple-100', text: 'text-purple-800' },
    'pink': { bg: 'bg-pink-100', text: 'text-pink-800' },
    'indigo': { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  };
  
  return colorMap[color] || { bg: 'bg-gray-100', text: 'text-gray-800' };
};

// Check user permissions
export const hasPermission = (
  documentAccess: Record<string, string>, 
  userId: string, 
  requiredLevel: string
): boolean => {
  const userAccess = documentAccess[userId];
  
  if (!userAccess) return false;
  
  const accessLevels = ['none', 'view', 'edit', 'download'];
  const userLevelIndex = accessLevels.indexOf(userAccess);
  const requiredLevelIndex = accessLevels.indexOf(requiredLevel);
  
  return userLevelIndex >= requiredLevelIndex;
};

// Convert blob to base64
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Generate breadcrumbs from folder path
export const generateBreadcrumbs = (
  folders: { id: string; name: string; parentId: string | null }[],
  currentFolderId: string
): { id: string; name: string }[] => {
  const breadcrumbs: { id: string; name: string }[] = [];
  let currentFolder = folders.find(f => f.id === currentFolderId);
  
  while (currentFolder) {
    breadcrumbs.unshift({ id: currentFolder.id, name: currentFolder.name });
    
    if (currentFolder.parentId === null) break;
    
    currentFolder = folders.find(f => f.id === currentFolder.parentId);
  }
  
  return breadcrumbs;
};