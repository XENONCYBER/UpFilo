import B2 from 'backblaze-b2';

// Initialize B2 client
const b2 = new B2({
  applicationKeyId: process.env.B2_APPLICATION_KEY_ID!,
  applicationKey: process.env.B2_APPLICATION_KEY!,
});

let isAuthorized = false;
let uploadUrl: string | null = null;
let uploadAuthToken: string | null = null;

// Authorize B2 and get upload URL
export async function authorizeB2() {
  if (!isAuthorized) {
    await b2.authorize();
    isAuthorized = true;
  }
  
  if (!uploadUrl || !uploadAuthToken) {
    const response = await b2.getUploadUrl({
      bucketId: process.env.B2_BUCKET_ID!,
    });
    uploadUrl = response.data.uploadUrl;
    uploadAuthToken = response.data.authorizationToken;
  }
  
  return { uploadUrl, uploadAuthToken };
}

// Upload file to B2
export async function uploadFileToB2(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<{
  fileId: string;
  fileName: string;
  url: string;
  size: number;
  originalName: string;
}> {
  try {
    // Ensure we're authorized and have upload URL
    const { uploadUrl: url, uploadAuthToken: token } = await authorizeB2();
    
    if (!url || !token) {
      throw new Error('Failed to get upload authorization');
    }

    // Generate unique filename to avoid conflicts in B2 storage
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${fileName}`;

    // Upload file
    const response = await b2.uploadFile({
      uploadUrl: url,
      uploadAuthToken: token,
      fileName: uniqueFileName,
      data: file,
      info: {
        'Content-Type': contentType,
        'X-Bz-Info-Original-Name': encodeURIComponent(fileName), // Store original name in metadata
      },
    });

    // Get download URL
    const downloadUrl = await getFileDownloadUrl(response.data.fileName);

    return {
      fileId: response.data.fileId,
      fileName: response.data.fileName, // B2 storage name (with timestamp)
      url: downloadUrl,
      size: file.length,
      originalName: fileName, // Original filename for display
    };
  } catch (error) {
    console.error('B2 upload error:', error);
    
    // Reset authorization on error
    isAuthorized = false;
    uploadUrl = null;
    uploadAuthToken = null;
    
    throw new Error(`Failed to upload file to B2: ${error}`);
  }
}

// Get download URL for a file
export async function getFileDownloadUrl(fileName: string): Promise<string> {
  try {
    // Use our internal streaming API route for serving files
    // This handles the B2 authorization and streaming internally
    const downloadUrl = `/api/stream/${encodeURIComponent(fileName)}`;
    
    return downloadUrl;
  } catch (error) {
    console.error('Error getting download URL:', error);
    throw new Error(`Failed to get download URL: ${error}`);
  }
}

// Delete file from B2
export async function deleteFileFromB2(fileId: string, fileName: string): Promise<void> {
  try {
    await authorizeB2();
    
    await b2.deleteFileVersion({
      fileId,
      fileName,
    });
  } catch (error) {
    console.error('B2 delete error:', error);
    throw new Error(`Failed to delete file from B2: ${error}`);
  }
}

// Delete file by filename only (finds file first, then deletes)
export async function deleteFileByName(fileName: string): Promise<boolean> {
  try {
    await authorizeB2();
    
    // List files to find the one with matching name
    const response = await b2.listFileNames({
      bucketId: process.env.B2_BUCKET_ID!,
      maxFileCount: 1,
      startFileName: fileName,
      delimiter: '',
      prefix: fileName,
    });
    
    const files = response.data.files;
    if (files.length === 0) {
      console.log(`File not found in B2: ${fileName}`);
      return false;
    }
    
    const file = files[0];
    if (file.fileName === fileName) {
      await b2.deleteFileVersion({
        fileId: file.fileId,
        fileName: file.fileName,
      });
      console.log(`Deleted file from B2: ${fileName}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('B2 delete by name error:', error);
    return false;
  }
}

// Delete multiple files by their URLs (extracts filename from URL)
export async function deleteFilesByUrls(urls: string[]): Promise<{ deleted: number; failed: number }> {
  let deleted = 0;
  let failed = 0;
  
  for (const url of urls) {
    try {
      // Extract filename from URL like /api/stream/filename
      const fileName = decodeURIComponent(url.split('/api/stream/')[1] || '');
      if (fileName) {
        const success = await deleteFileByName(fileName);
        if (success) {
          deleted++;
        } else {
          failed++;
        }
      }
    } catch (error) {
      console.error(`Failed to delete file from URL ${url}:`, error);
      failed++;
    }
  }
  
  return { deleted, failed };
}

// List files in bucket (optional utility)
export async function listFiles(maxFileCount = 100) {
  try {
    await authorizeB2();
    
    const response = await b2.listFileNames({
      bucketId: process.env.B2_BUCKET_ID!,
      maxFileCount,
      startFileName: '',
      delimiter: '',
      prefix: '',
    });
    
    return response.data.files;
  } catch (error) {
    console.error('B2 list files error:', error);
    throw new Error(`Failed to list files: ${error}`);
  }
}

export default b2;
