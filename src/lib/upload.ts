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
    return new Promise<UploadedFile>((resolve, reject) => {
      try {
        // Update status to uploading
        uploadProgress[index].status = 'uploading';
        onProgress?.(uploadProgress);

        const formData = new FormData();
        formData.append('file', file);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/uploadFile');
        xhr.responseType = 'json';

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            uploadProgress[index].progress = percent;
            console.log(`Upload progress for ${file.name}: ${percent}%`);
            onProgress?.(uploadProgress);
          }
        };

        xhr.onloadstart = () => {
          console.log(`Upload started for ${file.name}`);
          uploadProgress[index].status = 'uploading';
          uploadProgress[index].progress = 0;
          onProgress?.(uploadProgress);
        };

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            uploadProgress[index].progress = percent;
            onProgress?.(uploadProgress);
          }
        };

        xhr.onloadstart = () => {
          uploadProgress[index].status = 'uploading';
          uploadProgress[index].progress = 0;
          onProgress?.(uploadProgress);
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const result = xhr.response ?? JSON.parse(xhr.responseText || '{}');
            uploadProgress[index].status = 'completed';
            uploadProgress[index].progress = 100;
            onProgress?.(uploadProgress);
            resolve({
              id: result.id,
              name: result.name,
              size: result.size,
              type: result.type,
              url: result.url,
            });
          } else {
            const errorMessage =
              (xhr.response && (xhr.response.error as string)) ||
              `Failed to upload ${file.name}`;
            uploadProgress[index].status = 'error';
            uploadProgress[index].error = errorMessage;
            onProgress?.(uploadProgress);
            reject(new Error(errorMessage));
          }
        };

        xhr.onerror = () => {
          const errorMessage = `Network error while uploading ${file.name}`;
          uploadProgress[index].status = 'error';
          uploadProgress[index].error = errorMessage;
          onProgress?.(uploadProgress);
          reject(new Error(errorMessage));
        };

        xhr.onabort = () => {
          const errorMessage = `Upload aborted for ${file.name}`;
          uploadProgress[index].status = 'error';
          uploadProgress[index].error = errorMessage;
          onProgress?.(uploadProgress);
          reject(new Error(errorMessage));
        };

        xhr.send(formData);
      } catch (error) {
        uploadProgress[index].status = 'error';
        uploadProgress[index].error = error instanceof Error ? error.message : 'Upload failed';
        onProgress?.(uploadProgress);
        reject(error as any);
      }
    });
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

export const isPDFFile = (type: string, name?: string): boolean => {
  return type === 'application/pdf' || name?.toLowerCase().endsWith('.pdf') || false;
};

export const isTextFile = (type: string, name?: string): boolean => {
  if (type.startsWith('text/')) return true;
  if (type === 'application/json' || type === 'application/xml') return true;
  
  const textExtensions = ['.txt', '.md', '.json', '.xml', '.csv'];
  if (name) {
    const lowerName = name.toLowerCase();
    return textExtensions.some(ext => lowerName.endsWith(ext));
  }
  
  return false;
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
    'text/markdown',
    'application/json',
    'application/xml',
    'text/xml',
  ];

  const typesToCheck = allowedTypes || defaultAllowedTypes;
  return typesToCheck.includes(file.type);
};
