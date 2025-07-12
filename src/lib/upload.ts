// Upload utility functions for handling multiple file uploads

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export const uploadFiles = async (files: File[]): Promise<UploadedFile[]> => {
  const uploadPromises = files.map(async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/uploadFile', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload ${file.name}`);
    }

    const result = await response.json();
    return {
      id: result.id || crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: result.url || URL.createObjectURL(file), // Fallback to blob URL for now
    };
  });

  return Promise.all(uploadPromises);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileTypeIcon = (type: string): string => {
  if (type.startsWith('image/')) return '🖼️';
  if (type.startsWith('video/')) return '🎥';
  if (type.startsWith('audio/')) return '🎵';
  if (type.includes('pdf')) return '📄';
  if (type.includes('document') || type.includes('word')) return '📝';
  if (type.includes('spreadsheet') || type.includes('excel')) return '📊';
  if (type.includes('presentation') || type.includes('powerpoint')) return '📈';
  return '📎';
};
