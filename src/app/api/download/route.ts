import { NextRequest, NextResponse } from 'next/server';
import { verifyDownloadToken } from '@/lib/token';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');

    if (!token) {
      return new NextResponse('Download token missing or expired', { status: 400 });
    }

    const payload = verifyDownloadToken(token);
    if (!payload || !payload.url) {
      return new NextResponse('Invalid or expired download token. Please refresh the page and try again.', { status: 403 });
    }

    // Sanitize filename to avoid header injection or invalid characters
    const safeFilename = payload.filename.replace(/[^a-zA-Z0-9_.-]/g, '_');

    // Check domain to only send Referer for Instagram CDN
    const isInstagram = payload.url.includes('instagram.com') || payload.url.includes('cdninstagram.com') || payload.url.includes('fbcdn.net');
    const upstreamHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    };
    if (isInstagram) {
      upstreamHeaders['Referer'] = 'https://www.instagram.com/';
    }

    // Fetch upstream media
    const upstreamRes = await fetch(payload.url, {
      headers: upstreamHeaders,
    });

    if (!upstreamRes.ok || !upstreamRes.body) {
      return new NextResponse(`Failed to fetch media from upstream CDN (${upstreamRes.status})`, {
        status: upstreamRes.status,
      });
    }

    const contentType = payload.mimeType || upstreamRes.headers.get('content-type') || 'application/octet-stream';
    const contentLength = upstreamRes.headers.get('content-length');

    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${safeFilename}"`);
    headers.set('Content-Type', contentType);
    headers.set('Cache-Control', 'public, max-age=3600');
    headers.set('Access-Control-Allow-Origin', '*');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    // Stream the media directly to the client
    return new NextResponse(upstreamRes.body as any, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    return new NextResponse(`Error proxying download: ${error?.message}`, { status: 500 });
  }
}
