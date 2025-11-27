import { NextRequest, NextResponse } from 'next/server';
import { deleteFilesByUrls } from '@/lib/backblaze';

// API endpoint to delete multiple files from Backblaze B2
// This should be called after deleting channels/groups to clean up associated files
export async function POST(request: NextRequest) {
  try {
    const { fileUrls } = await request.json();

    if (!fileUrls || !Array.isArray(fileUrls)) {
      return NextResponse.json(
        { error: 'fileUrls array is required' },
        { status: 400 }
      );
    }

    if (fileUrls.length === 0) {
      return NextResponse.json({
        success: true,
        deleted: 0,
        failed: 0,
        message: 'No files to delete',
      });
    }

    console.log(`Deleting ${fileUrls.length} files from B2...`);
    
    const result = await deleteFilesByUrls(fileUrls);

    console.log(`Deletion complete: ${result.deleted} deleted, ${result.failed} failed`);

    return NextResponse.json({
      success: true,
      deleted: result.deleted,
      failed: result.failed,
      message: `Deleted ${result.deleted} files, ${result.failed} failed`,
    });

  } catch (error) {
    console.error('Bulk delete error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to delete files',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
