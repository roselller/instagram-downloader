import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { verifyZipToken } from '@/lib/token';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');

    if (!token) {
      return new NextResponse('ZIP download token missing or expired', { status: 400 });
    }

    const payload = verifyZipToken(token);
    if (!payload || !payload.items || payload.items.length === 0) {
      return new NextResponse('Invalid or expired ZIP token. Please try fetching the post again.', { status: 403 });
    }

    const safeShortcode = (payload.shortcode || 'carousel').replace(/[^a-zA-Z0-9_-]/g, '');
    const zipFilename = `instasave_${safeShortcode}_carousel.zip`;

    const zip = new JSZip();

    // Fetch items concurrently with limit
    const fetchPromises = payload.items.map(async (item) => {
      try {
        const isInstagram = item.url.includes('instagram.com') || item.url.includes('cdninstagram.com') || item.url.includes('fbcdn.net');
        const upstreamHeaders: Record<string, string> = {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        };
        if (isInstagram) {
          upstreamHeaders['Referer'] = 'https://www.instagram.com/';
        }

        const res = await fetch(item.url, {
          headers: upstreamHeaders,
        });

        if (res.ok) {
          const buffer = await res.arrayBuffer();
          const safeName = item.filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
          zip.file(safeName, buffer);
        }
      } catch (err) {
        console.error(`Error fetching item ${item.filename} for zip:`, err);
      }
    });

    await Promise.all(fetchPromises);

    const zipContent = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    const headers = new Headers();
    headers.set('Content-Type', 'application/zip');
    headers.set('Content-Disposition', `attachment; filename="${zipFilename}"`);
    headers.set('Content-Length', zipContent.byteLength.toString());
    headers.set('Cache-Control', 'no-cache, no-store');

    return new NextResponse(new Uint8Array(zipContent), {
      status: 200,
      headers,
    });
  } catch (error: any) {
    return new NextResponse(`Error generating ZIP: ${error?.message}`, { status: 500 });
  }
}
