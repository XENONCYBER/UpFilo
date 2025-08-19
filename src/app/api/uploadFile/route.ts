import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToB2 } from '@/lib/backblaze';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 100MB.' },
        { status: 400 }
      );
    }

    // Validate file type (you can customize this)
    const allowedTypes = [
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

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Backblaze B2
    const result = await uploadFileToB2(
      buffer,
      file.name,
      file.type
    );

    return NextResponse.json({
      id: result.fileId,
      name: result.fileName,
      url: result.url,
      size: result.size,
      type: file.type,
      success: true,
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Optional: Handle file deletion
export async function DELETE(request: NextRequest) {
  try {
    const { fileId, fileName } = await request.json();

    if (!fileId || !fileName) {
      return NextResponse.json(
        { error: 'File ID and name are required' },
        { status: 400 }
      );
    }

    // Note: You might want to add authentication/authorization here
    // to ensure only authorized users can delete files

    const { deleteFileFromB2 } = await import('@/lib/backblaze');
    await deleteFileFromB2(fileId, fileName);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to delete file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
