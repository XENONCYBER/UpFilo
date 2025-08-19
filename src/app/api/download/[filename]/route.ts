import { NextRequest, NextResponse } from 'next/server';
import B2 from 'backblaze-b2';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = decodeURIComponent(params.filename);
    
    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      );
    }

    // Create a fresh B2 instance for this request
    const b2 = new B2({
      applicationKeyId: process.env.B2_APPLICATION_KEY_ID!,
      applicationKey: process.env.B2_APPLICATION_KEY!,
    });

    // Authorize B2
    await b2.authorize();

    try {
      // Try to get download authorization for private files
      const downloadAuth = await b2.getDownloadAuthorization({
        bucketId: process.env.B2_BUCKET_ID!,
        fileNamePrefix: filename,
        validDurationInSeconds: 3600, // 1 hour
      });

      // Create download URL with authorization
      const bucketName = process.env.B2_BUCKET_NAME!;
      const downloadUrl = `https://f004.backblazeb2.com/file/${bucketName}/${filename}?Authorization=${downloadAuth.data.authorizationToken}`;

      // Redirect to the authorized download URL
      return NextResponse.redirect(downloadUrl);

    } catch (authError) {
      console.log('Download authorization failed, trying direct URL:', authError);
      
      // If download authorization fails, try direct URL (for public buckets)
      const bucketName = process.env.B2_BUCKET_NAME!;
      const directUrl = `https://f004.backblazeb2.com/file/${bucketName}/${filename}`;
      
      // Test if direct URL works by making a HEAD request
      const testResponse = await fetch(directUrl, { method: 'HEAD' });
      
      if (testResponse.ok) {
        return NextResponse.redirect(directUrl);
      } else {
        throw new Error('File not accessible');
      }
    }

  } catch (error) {
    console.error('Download error:', error);
    
    // Return a more user-friendly error
    return NextResponse.json(
      { 
        error: 'File not found or access denied',
        details: error instanceof Error ? error.message : 'Unknown error',
        filename: params.filename
      },
      { status: 404 }
    );
  }
}
