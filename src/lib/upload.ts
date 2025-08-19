// Upload utility functions for handling multiple file uploads with Backblaze B2

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export const uploadFiles = async (
  files: File[],
  onProgress?: (progress: UploadProgress[]) => void
): Promise<UploadedFile[]> => {
  const uploadProgress: UploadProgress[] = files.map(file => ({
    file,
    progress: 0,
    status: 'pending'
  }));

  const uploadPromises = files.map(async (file, index) => {
    try {
      // Update status to uploading
      uploadProgress[index].status = 'uploading';
      onProgress?.(uploadProgress);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/uploadFile', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to upload ${file.name}`);
      }

      const result = await response.json();
      
      // Update status to completed
      uploadProgress[index].status = 'completed';
      uploadProgress[index].progress = 100;
      onProgress?.(uploadProgress);

      return {
        id: result.id,
        name: result.name,
        size: result.size,
        type: result.type,
        url: result.url,
      };
    } catch (error) {
      // Update status to error
      uploadProgress[index].status = 'error';
      uploadProgress[index].error = error instanceof Error ? error.message : 'Upload failed';
      onProgress?.(uploadProgress);
      
      throw error;
    }
  });

  return Promise.all(uploadPromises);
};

export const uploadSingleFile = async (file: File): Promise<UploadedFile> => {
  const results = await uploadFiles([file]);
  return results[0];
};

export const deleteFile = async (fileId: string, fileName: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/uploadFile', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileId, fileName }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete file');
    }

    return true;
  } catch (error) {
    console.error('Delete file error:', error);
    return false;
  }
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

export const isImageFile = (type: string): boolean => {
  return type.startsWith('image/');
};

export const isVideoFile = (type: string): boolean => {
  return type.startsWith('video/');
};

export const isAudioFile = (type: string): boolean => {
  return type.startsWith('audio/');
};

export const validateFileSize = (file: File, maxSizeMB = 100): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

export const validateFileType = (file: File, allowedTypes?: string[]): boolean => {
  const defaultAllowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/wav',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ];

  const typesToCheck = allowedTypes || defaultAllowedTypes;
  return typesToCheck.includes(file.type);
};
