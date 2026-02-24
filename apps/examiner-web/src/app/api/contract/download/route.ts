import { NextRequest, NextResponse } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { ENV } from '@/constants/variables';
import s3Client from '@/lib/s3-client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/domains/auth/server/nextauth/options';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error('Download contract: Unauthorized - no session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const s3Key = searchParams.get('key');

    if (!s3Key) {
      console.error('Download contract: Missing S3 key');
      return NextResponse.json({ error: 'S3 key is required' }, { status: 400 });
    }

    console.log('Download contract: Attempting to download from S3 key:', s3Key);

    // Get the file from S3
    const command = new GetObjectCommand({
      Bucket: ENV.AWS_S3_BUCKET!,
      Key: s3Key,
    });

    let response;
    try {
      response = await s3Client.send(command);
    } catch (s3Error: unknown) {
      const error = s3Error as { name?: string; message?: string };
      console.error('S3 error:', error);

      if (error.name === 'NoSuchKey') {
        return NextResponse.json({ error: `File not found in S3: ${s3Key}` }, { status: 404 });
      }

      if (error.name === 'AccessDenied') {
        return NextResponse.json({ error: 'Access denied to S3 file' }, { status: 403 });
      }

      throw s3Error;
    }

    if (!response.Body) {
      console.error('Download contract: S3 response has no body');
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Convert stream to buffer using transformToByteArray
    const buffer = Buffer.from(
      await (
        response.Body as { transformToByteArray: () => Promise<Uint8Array> }
      ).transformToByteArray()
    );

    console.log(`Download contract: Successfully downloaded ${buffer.length} bytes`);

    // Return the file with proper download headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': response.ContentType || 'application/pdf',
        'Content-Disposition': 'attachment; filename="Contract.pdf"',
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error: unknown) {
    console.error('Error downloading contract:', error);
    return NextResponse.json(
      {
        error:
          (error instanceof Error ? error.message : undefined) || 'Failed to download contract',
      },
      { status: 500 }
    );
  }
}
