import { NextRequest, NextResponse } from 'next/server';
import { getPostMetadata } from '@/lib/instagram';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_URL',
            message: 'Please provide a valid Instagram post URL.',
          },
        },
        { status: 400 }
      );
    }

    const result = await getPostMetadata(url);

    if (!result.success) {
      const statusCode = 
        result.error?.code === 'INVALID_URL' ? 400 :
        result.error?.code === 'PRIVATE_ACCOUNT' ? 403 :
        result.error?.code === 'POST_NOT_FOUND' ? 404 :
        result.error?.code === 'RATE_LIMITED' ? 429 : 500;

      return NextResponse.json(result, { status: statusCode });
    }

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'An unexpected error occurred while fetching the post metadata. Please try again.',
          details: error?.message,
        },
      },
      { status: 500 }
    );
  }
}
