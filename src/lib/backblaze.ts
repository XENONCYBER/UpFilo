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
}> {
  try {
    // Ensure we're authorized and have upload URL
    const { uploadUrl: url, uploadAuthToken: token } = await authorizeB2();
    
    if (!url || !token) {
      throw new Error('Failed to get upload authorization');
    }

    // Generate unique filename to avoid conflicts
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
      },
    });

    // Get download URL
    const downloadUrl = await getFileDownloadUrl(response.data.fileName);

    return {
      fileId: response.data.fileId,
      fileName: response.data.fileName,
      url: downloadUrl,
      size: file.length,
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
