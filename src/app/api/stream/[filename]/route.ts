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

    // Try direct download first
    try {
      const downloadResponse = await b2.downloadFileByName({
        bucketName: process.env.B2_BUCKET_NAME!,
        fileName: filename,
        responseType: 'arraybuffer',
      });

      // Determine content type from file extension if not provided
      let contentType = 'application/octet-stream';
      const ext = filename.toLowerCase().split('.').pop();
      
      switch (ext) {
        case 'jpg':
        case 'jpeg':
          contentType = 'image/jpeg';
          break;
        case 'png':
          contentType = 'image/png';
          break;
        case 'gif':
          contentType = 'image/gif';
          break;
        case 'webp':
          contentType = 'image/webp';
          break;
        case 'mp4':
          contentType = 'video/mp4';
          break;
        case 'webm':
          contentType = 'video/webm';
          break;
        case 'mp3':
          contentType = 'audio/mpeg';
          break;
        case 'wav':
          contentType = 'audio/wav';
          break;
        case 'pdf':
          contentType = 'application/pdf';
          break;
      }
      
      // Set appropriate headers
      const headers = new Headers();
      headers.set('Content-Type', contentType);
      headers.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      
      // For images, videos, audio, and PDFs, allow inline viewing
      if (contentType.startsWith('image/') || 
          contentType.startsWith('video/') || 
          contentType.startsWith('audio/') ||
          contentType === 'application/pdf') {
        headers.set('Content-Disposition', `inline; filename="${filename}"`);
      } else {
        headers.set('Content-Disposition', `attachment; filename="${filename}"`);
      }

      return new NextResponse(downloadResponse.data, {
        headers,
      });

    } catch (downloadError) {
      console.log('Direct download failed, trying fallback URL:', downloadError);
      
      // Fallback to redirect to B2 direct URL
      const bucketName = process.env.B2_BUCKET_NAME!;
      const directUrl = `https://f004.backblazeb2.com/file/${bucketName}/${filename}`;
      
      return NextResponse.redirect(directUrl);
    }

  } catch (error) {
    console.error('Stream download error:', error);
    
    const filename = decodeURIComponent(params.filename);
    
    // Final fallback - try direct URL without auth
    try {
      const bucketName = process.env.B2_BUCKET_NAME!;
      const directUrl = `https://f004.backblazeb2.com/file/${bucketName}/${filename}`;
      
      // Test if the URL is accessible
      const response = await fetch(directUrl, { method: 'HEAD' });
      if (response.ok) {
        return NextResponse.redirect(directUrl);
      }
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
    }
    
    return NextResponse.json(
      { 
        error: 'File not accessible',
        details: error instanceof Error ? error.message : 'Unknown error',
        filename: filename,
        suggestion: 'Check if your B2 bucket is public or has correct permissions'
      },
      { status: 404 }
    );
  }
}
