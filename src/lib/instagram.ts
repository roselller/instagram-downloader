import { PostMetadata, MediaItem, FetchPostResponse } from './types';
import { createDownloadToken, createZipToken } from './token';
import fs from 'fs';
import path from 'path';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

/**
 * Robust shortcode extractor supporting /p/, /reel/, /reels/, /tv/, /share/p/, /share/reel/,
 * query parameters (?igsh=...), and automatic redirect resolution for share links.
 */
export async function resolveAndExtractShortcode(inputUrl: string): Promise<{ shortcode: string; typeHint: 'p' | 'reel' | 'reels' | 'tv' } | null> {
  try {
    let cleanUrl = inputUrl.trim().split('#')[0]; // remove anchor/fragment

    // If it's an Instagram share redirect link without a direct /p/ or /reel/ path, resolve it first
    if (cleanUrl.includes('/share/') && !cleanUrl.match(/\/share\/(?:p|reel|reels|tv)\//i)) {
      try {
        console.log(`[Shortcode Extractor] Resolving redirect for share URL: ${cleanUrl}`);
        const headRes = await fetch(cleanUrl, {
          method: 'HEAD',
          headers: { 'User-Agent': USER_AGENT },
          redirect: 'follow',
        });
        if (headRes.url && headRes.url !== cleanUrl) {
          console.log(`[Shortcode Extractor] Share redirect resolved to: ${headRes.url}`);
          cleanUrl = headRes.url;
        }
      } catch (err) {
        console.warn(`[Shortcode Extractor] Failed to resolve redirect:`, err);
      }
    }

    // Match shortcode across various standard and share formats
    const regex = /(?:https?:\/\/)?(?:www\.|m\.)?instagram\.com\/(?:share\/)?(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i;
    const match = cleanUrl.match(regex);

    if (!match || !match[2]) {
      console.warn(`[Shortcode Extractor] Failed to extract shortcode from: "${cleanUrl}"`);
      return null;
    }

    const typeHint = match[1].toLowerCase() as 'p' | 'reel' | 'reels' | 'tv';
    const shortcode = match[2];

    console.log(`[Shortcode Extractor] Input: "${inputUrl}" -> Extracted Shortcode: "${shortcode}" (Type: "${typeHint}")`);

    return { typeHint, shortcode };
  } catch (err) {
    console.error(`[Shortcode Extractor] Exception extracting shortcode:`, err);
    return null;
  }
}

// Convert Instagram shortcode to 64-bit integer media_id
export function shortcodeToMediaId(shortcode: string): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let id = BigInt(0);
  for (let i = 0; i < shortcode.length; i++) {
    const val = BigInt(alphabet.indexOf(shortcode[i]));
    id = id * BigInt(64) + val;
  }
  return id.toString();
}

/**
 * Curated high-fidelity mock posts for instant testing and demo fallback
 */
const SAMPLE_POSTS: Record<string, Partial<PostMetadata>> = {
  'sample_reel': {
    shortcode: 'sample_reel',
    originalUrl: 'https://www.instagram.com/reel/C8xYzDemo1/',
    postType: 'video',
    author: {
      username: 'earthpix',
      fullName: 'Earth Pix',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
      isVerified: true,
    },
    caption: 'Breathtaking sunset over the Swiss Alps 🏔️✨ The golden hour glow hitting the snowy peaks is simply unreal. Have you ever witnessed something this majestic? #nature #alps #mountains #travel #sunset',
    timestamp: Date.now() - 3600000 * 24 * 2,
    likesCount: 142850,
    commentsCount: 3240,
    itemsCount: 1,
  },
  'sample_carousel': {
    shortcode: 'sample_carousel',
    originalUrl: 'https://www.instagram.com/p/C32sDemoCarousel/',
    postType: 'carousel',
    author: {
      username: 'natgeo',
      fullName: 'National Geographic',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80',
      isVerified: true,
    },
    caption: 'Moments captured across the African savannah 🐘🦁 Swipe through to explore wildlife in their natural habitat as evening falls over the Serengeti. Photographed on assignment for National Geographic.',
    timestamp: Date.now() - 3600000 * 12,
    likesCount: 389200,
    commentsCount: 4510,
    itemsCount: 4,
  },
  'sample_photo': {
    shortcode: 'sample_photo',
    originalUrl: 'https://www.instagram.com/p/C9PhotoDemo/',
    postType: 'photo',
    author: {
      username: 'nasa',
      fullName: 'NASA',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
      isVerified: true,
    },
    caption: 'Cosmic wonders captured by the James Webb Space Telescope 🌌 Deep space view revealing thousands of distant galaxies formed in the early universe billions of years ago. Photo credit: NASA/ESA/CSA.',
    timestamp: Date.now() - 3600000 * 48,
    likesCount: 672100,
    commentsCount: 9140,
    itemsCount: 1,
  }
};

function buildSampleMetadata(key: string, shortcode: string): PostMetadata {
  const base = SAMPLE_POSTS[key] || SAMPLE_POSTS['sample_reel'];
  
  if (key === 'sample_photo') {
    const rawPhotoUrl = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=85&w=2400&auto=format&fit=crop';
    const hdToken = createDownloadToken({
      url: rawPhotoUrl,
      filename: `instasave_nasa_${shortcode}_original.jpg`,
      mimeType: 'image/jpeg',
      shortcode,
    });
    const sdToken = createDownloadToken({
      url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=75&w=1200&auto=format&fit=crop',
      filename: `instasave_nasa_${shortcode}_standard.jpg`,
      mimeType: 'image/jpeg',
      shortcode,
    });

    const item: MediaItem = {
      id: `${shortcode}_1`,
      type: 'photo',
      index: 1,
      previewUrl: rawPhotoUrl,
      downloadUrl: `/api/download?token=${hdToken}`,
      filename: `instasave_nasa_${shortcode}.jpg`,
      width: 2400,
      height: 1600,
      qualities: [
        {
          label: 'Original Quality (2400x1600 Ultra HD)',
          downloadUrl: `/api/download?token=${hdToken}`,
          resolution: '2400x1600',
        },
        {
          label: 'Standard Quality (1200x800 HD)',
          downloadUrl: `/api/download?token=${sdToken}`,
          resolution: '1200x800',
        }
      ]
    };

    return {
      shortcode,
      originalUrl: base.originalUrl!,
      postType: 'photo',
      author: base.author!,
      caption: base.caption!,
      timestamp: base.timestamp,
      likesCount: base.likesCount,
      commentsCount: base.commentsCount,
      itemsCount: 1,
      items: [item],
    };
  }

  if (key === 'sample_carousel') {
    const carouselRaw = [
      {
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?q=85&w=2000&auto=format&fit=crop',
        preview: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?q=80&w=1000&auto=format&fit=crop',
        ext: 'jpg',
        mime: 'image/jpeg',
        w: 2000,
        h: 1333,
      },
      {
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?q=85&w=2000&auto=format&fit=crop',
        preview: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1000&auto=format&fit=crop',
        ext: 'jpg',
        mime: 'image/jpeg',
        w: 2000,
        h: 1333,
      },
      {
        type: 'video' as const,
        url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        preview: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?q=80&w=1000&auto=format&fit=crop',
        ext: 'mp4',
        mime: 'video/mp4',
        w: 1920,
        h: 1080,
      },
      {
        type: 'photo' as const,
        url: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?q=85&w=2000&auto=format&fit=crop',
        preview: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?q=80&w=1000&auto=format&fit=crop',
        ext: 'jpg',
        mime: 'image/jpeg',
        w: 2000,
        h: 1333,
      }
    ];

    const items: MediaItem[] = carouselRaw.map((raw, idx) => {
      const filename = `instasave_${shortcode}_${idx + 1}.${raw.ext}`;
      const token = createDownloadToken({
        url: raw.url,
        filename,
        mimeType: raw.mime,
        shortcode,
      });

      return {
        id: `${shortcode}_${idx + 1}`,
        type: raw.type,
        index: idx + 1,
        previewUrl: raw.preview,
        downloadUrl: `/api/download?token=${token}`,
        filename,
        width: raw.w,
        height: raw.h,
        qualities: [
          {
            label: raw.type === 'video' ? 'Full HD 1080p MP4' : 'High Resolution HD',
            downloadUrl: `/api/download?token=${token}`,
            resolution: `${raw.w}x${raw.h}`,
          }
        ]
      };
    });

    const zipToken = createZipToken({
      shortcode,
      items: carouselRaw.map((raw, idx) => ({
        url: raw.url,
        filename: `item_${idx + 1}_${shortcode}.${raw.ext}`,
      })),
    });

    return {
      shortcode,
      originalUrl: base.originalUrl!,
      postType: 'carousel',
      author: base.author!,
      caption: base.caption!,
      timestamp: base.timestamp,
      likesCount: base.likesCount,
      commentsCount: base.commentsCount,
      itemsCount: items.length,
      items,
      zipDownloadUrl: `/api/download-zip?token=${zipToken}`,
    };
  }

  // Single Video / Reel
  const hdVideoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
  const sdVideoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
  
  const hdToken = createDownloadToken({
    url: hdVideoUrl,
    filename: `instasave_earthpix_${shortcode}_1080p.mp4`,
    mimeType: 'video/mp4',
    shortcode,
  });
  const sdToken = createDownloadToken({
    url: sdVideoUrl,
    filename: `instasave_earthpix_${shortcode}_720p.mp4`,
    mimeType: 'video/mp4',
    shortcode,
  });

  const item: MediaItem = {
    id: `${shortcode}_1`,
    type: 'video',
    index: 1,
    previewUrl: hdVideoUrl,
    downloadUrl: `/api/download?token=${hdToken}`,
    filename: `instasave_earthpix_${shortcode}.mp4`,
    width: 1920,
    height: 1080,
    qualities: [
      {
        label: '1080p Full HD (High Quality)',
        downloadUrl: `/api/download?token=${hdToken}`,
        resolution: '1920x1080',
      },
      {
        label: '720p HD (Fast Download)',
        downloadUrl: `/api/download?token=${sdToken}`,
        resolution: '1280x720',
      }
    ]
  };

  return {
    shortcode,
    originalUrl: base.originalUrl!,
    postType: 'video',
    author: base.author!,
    caption: base.caption!,
    timestamp: base.timestamp,
    likesCount: base.likesCount,
    commentsCount: base.commentsCount,
    itemsCount: 1,
    items: [item],
  };
}

/**
 * Dynamically load Instagram credentials from process.env and .env.local
 */
function loadEnvCredentials(): Record<string, string> {
  const env: Record<string, string> = {};

  // 1. Process environment variables
  for (const k of ['INSTAGRAM_SESSION_ID', 'INSTAGRAM_CSRF_TOKEN', 'INSTAGRAM_USER_ID', 'INSTAGRAM_MID', 'INSTAGRAM_COOKIE']) {
    if (process.env[k]) env[k] = process.env[k]!;
  }

  // 2. Dynamically inspect .env.local on disk so credentials take effect without restarting
  try {
    const envLocalPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envLocalPath)) {
      const content = fs.readFileSync(envLocalPath, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1).trim();
          }
          if (val) {
            env[key] = val;
          }
        }
      }
    }
  } catch (err) {
    console.warn('[Instagram Session] Note: Could not read .env.local file directly:', err);
  }

  return env;
}

export interface InstagramSession {
  cookieHeader: string;
  csrfToken: string;
  isAuthenticated: boolean;
}

/**
 * Fetch Instagram session headers and cookies.
 * If user credentials exist in environment/.env.local, use them directly without contaminating
 * with anonymous CSRF tokens.
 */
async function fetchInstagramSession(): Promise<InstagramSession> {
  const env = loadEnvCredentials();

  // If user provided session credentials, use them directly
  if (env.INSTAGRAM_SESSION_ID || env.INSTAGRAM_COOKIE) {
    const cookies: string[] = [];

    if (env.INSTAGRAM_COOKIE) {
      cookies.push(env.INSTAGRAM_COOKIE.trim());
    }
    if (env.INSTAGRAM_SESSION_ID) {
      const sid = env.INSTAGRAM_SESSION_ID.trim();
      cookies.push(sid.startsWith('sessionid=') ? sid : `sessionid=${sid}`);
    }
    if (env.INSTAGRAM_USER_ID) {
      const uid = env.INSTAGRAM_USER_ID.trim();
      cookies.push(uid.startsWith('ds_user_id=') ? uid : `ds_user_id=${uid}`);
    }
    if (env.INSTAGRAM_CSRF_TOKEN) {
      const csrf = env.INSTAGRAM_CSRF_TOKEN.trim();
      cookies.push(csrf.startsWith('csrftoken=') ? csrf : `csrftoken=${csrf}`);
    }
    if (env.INSTAGRAM_MID) {
      const mid = env.INSTAGRAM_MID.trim();
      cookies.push(mid.startsWith('mid=') ? mid : `mid=${mid}`);
    }

    const csrfToken = env.INSTAGRAM_CSRF_TOKEN ? env.INSTAGRAM_CSRF_TOKEN.trim() : '';

    console.log(`[Instagram Session] Authenticated credentials active (Session: Yes, CSRF: ${csrfToken ? 'Yes' : 'No'}, User: ${Boolean(env.INSTAGRAM_USER_ID)}, MID: ${Boolean(env.INSTAGRAM_MID)})`);

    return {
      cookieHeader: cookies.join('; '),
      csrfToken,
      isAuthenticated: true,
    };
  }

  // Fallback to anonymous session handshake
  try {
    const res = await fetch('https://www.instagram.com/', {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    const setCookieHeaders = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get('set-cookie') || ''];
    const cookies: string[] = [];
    let csrfToken = '';

    for (const h of setCookieHeaders) {
      if (!h) continue;
      const part = h.split(';')[0];
      cookies.push(part);
      if (part.startsWith('csrftoken=')) {
        csrfToken = part.replace('csrftoken=', '');
      }
    }

    const cookieHeader = cookies.join('; ');
    console.log(`[Instagram Handshake] Anonymous status: ${res.status}, CSRF: "${csrfToken ? 'found' : 'none'}", Cookies Count: ${cookies.length}`);

    return {
      cookieHeader,
      csrfToken: csrfToken || '04MciCgWXrFtQHHEw0GjLK',
      isAuthenticated: false,
    };
  } catch (err) {
    console.warn(`[Instagram Handshake] Warning: Anonymous session handshake failed:`, err);
    return {
      cookieHeader: '',
      csrfToken: '',
      isAuthenticated: false,
    };
  }
}

interface GraphQLResult {
  status: 'SUCCESS' | 'POST_NOT_FOUND' | 'PRIVATE_ACCOUNT' | 'RATE_LIMITED' | 'UNKNOWN';
  media?: any;
  rawStatus?: number;
  rawBodySnippet?: string;
  errorMessage?: string;
}

/**
 * Query Instagram GraphQL with retries, exponential backoff, and full response logging
 */
async function queryGraphQLWithRetry(
  shortcode: string,
  session: { cookieHeader: string; csrfToken: string },
  maxRetries = 2
): Promise<GraphQLResult> {
  const docIds = ['9510064595728286', '27128499623469141', '8845758582119845'];

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    for (const doc_id of docIds) {
      try {
        const variables = JSON.stringify({
          shortcode,
          fetch_tagged_user_count: null,
          hoisted_comment_id: null,
          hoisted_reply_id: null,
        });

        const body = new URLSearchParams({
          doc_id,
          variables,
        });

        const headers: Record<string, string> = {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-IG-App-ID': '936619743392459',
          'User-Agent': USER_AGENT,
          'X-FB-Friendly-Name': 'PolarisPostRootQuery',
          'X-Requested-With': 'XMLHttpRequest',
          'Referer': `https://www.instagram.com/p/${shortcode}/`,
        };

        if (session.csrfToken) headers['X-CSRFToken'] = session.csrfToken;
        if (session.cookieHeader) headers['Cookie'] = session.cookieHeader;

        console.log(`[GraphQL Request] Attempt ${attempt}/${maxRetries} | doc_id: ${doc_id} | shortcode: ${shortcode}`);

        const res = await fetch('https://www.instagram.com/graphql/query', {
          method: 'POST',
          headers,
          body: body.toString(),
        });

        const text = await res.text();
        const snippet = text.substring(0, 500);

        // FULL RAW RESPONSE LOGGING as requested in debugging steps
        console.log(`[GraphQL Raw Response] Status: ${res.status} ${res.statusText} | Length: ${text.length} | Snippet: ${snippet}`);

        // 1. Check for genuine 404 / Post Not Found
        if (
          text.includes('Page Not Found &bull; Instagram') ||
          text.includes('The link you followed may be broken, or the page may have been removed.') ||
          (text.includes('pageID":"httpErrorPage') && (res.status === 404 || text.includes('Page Not Found')))
        ) {
          console.warn(`[GraphQL Result] Detected genuine deleted/nonexistent post for shortcode: ${shortcode}`);
          return {
            status: 'POST_NOT_FOUND',
            rawStatus: res.status,
            rawBodySnippet: snippet,
            errorMessage: 'Post Not Found or Deleted',
          };
        }

        // 2. Check for rate limit / challenge / require_login
        if (
          res.status === 429 ||
          res.status === 401 ||
          text.includes('Please wait a few minutes before you try again') ||
          text.includes('require_login') ||
          text.includes('login_required')
        ) {
          console.warn(`[GraphQL Result] Instagram throttling/login wall detected (HTTP ${res.status}).`);
          
          if (attempt < maxRetries) {
            const delayMs = attempt * 800;
            console.log(`[GraphQL Retry] Waiting ${delayMs}ms before attempt ${attempt + 1}...`);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            break; // Try next attempt with refreshed backoff
          }

          return {
            status: 'RATE_LIMITED',
            rawStatus: res.status,
            rawBodySnippet: snippet,
            errorMessage: 'Service temporarily unavailable, please try again shortly',
          };
        }

        // 3. Check for successful JSON
        if (res.ok && text.startsWith('{')) {
          try {
            const json = JSON.parse(text);
            const media = json?.data?.xdt_shortcode_media || json?.data?.shortcode_media;
            if (media) {
              if (media.owner?.is_private) {
                return {
                  status: 'PRIVATE_ACCOUNT',
                  rawStatus: res.status,
                  rawBodySnippet: snippet,
                  errorMessage: 'This account is private',
                };
              }
              return {
                status: 'SUCCESS',
                media,
                rawStatus: res.status,
                rawBodySnippet: snippet,
              };
            }
          } catch (jsonErr) {
            console.warn(`[GraphQL JSON Parse Warning]:`, jsonErr);
          }
        }
      } catch (err: any) {
        console.error(`[GraphQL Attempt Error] doc_id: ${doc_id} failed:`, err?.message);
      }
    }
  }

  return { status: 'UNKNOWN' };
}

/**
 * Format raw Instagram API object into PostMetadata
 */
function formatInstagramMedia(media: any, originalUrl: string, shortcode: string): PostMetadata {
  const owner = media.owner || {};
  const isVideo = Boolean(media.is_video);
  const isSidecar = media.__typename === 'XDTGraphSidecar' || media.__typename === 'GraphSidecar' || Boolean(media.edge_sidecar_to_children);

  const captionNode = media.edge_media_to_caption?.edges?.[0]?.node;
  const caption = captionNode ? captionNode.text : '';

  const author = {
    username: owner.username || 'instagram_user',
    fullName: owner.full_name || owner.username || 'Instagram User',
    avatarUrl: owner.profile_pic_url,
    isVerified: Boolean(owner.is_verified),
  };

  const likesCount = media.edge_media_preview_like?.count || media.like_count || 0;
  const commentsCount = media.edge_media_to_comment?.count || media.comment_count || 0;
  const timestamp = media.taken_at_timestamp ? media.taken_at_timestamp * 1000 : Date.now();

  const items: MediaItem[] = [];

  if (isSidecar && media.edge_sidecar_to_children?.edges) {
    const edges = media.edge_sidecar_to_children.edges;
    edges.forEach((edge: any, index: number) => {
      const node = edge.node;
      const nodeIsVideo = Boolean(node.is_video);
      const itemIndex = index + 1;
      
      let bestUrl = '';
      const qualities: any[] = [];

      if (nodeIsVideo) {
        const videoVersions = node.video_versions || [];
        if (videoVersions.length > 0) {
          bestUrl = videoVersions[0].url;
          videoVersions.forEach((v: any) => {
            const token = createDownloadToken({
              url: v.url,
              filename: `instasave_${author.username}_${shortcode}_${itemIndex}_${v.height || 'hd'}p.mp4`,
              mimeType: 'video/mp4',
              shortcode,
            });
            qualities.push({
              label: `${v.height ? `${v.height}p` : 'HD'} Video (${v.width || ''}x${v.height || ''})`,
              downloadUrl: `/api/download?token=${token}`,
              resolution: `${v.width}x${v.height}`,
            });
          });
        } else {
          bestUrl = node.video_url;
        }
      } else {
        const displayResources = node.display_resources || [];
        if (displayResources.length > 0) {
          const sorted = [...displayResources].sort((a: any, b: any) => (b.config_width || 0) - (a.config_width || 0));
          bestUrl = sorted[0].src;
          sorted.forEach((r: any) => {
            const token = createDownloadToken({
              url: r.src,
              filename: `instasave_${author.username}_${shortcode}_${itemIndex}_${r.config_width}w.jpg`,
              mimeType: 'image/jpeg',
              shortcode,
            });
            qualities.push({
              label: `${r.config_width}x${r.config_height}px`,
              downloadUrl: `/api/download?token=${token}`,
              resolution: `${r.config_width}x${r.config_height}`,
            });
          });
        } else {
          bestUrl = node.display_url;
        }
      }

      if (!bestUrl) {
        bestUrl = nodeIsVideo ? node.video_url : node.display_url;
      }

      const defaultToken = createDownloadToken({
        url: bestUrl,
        filename: `instasave_${author.username}_${shortcode}_${itemIndex}.${nodeIsVideo ? 'mp4' : 'jpg'}`,
        mimeType: nodeIsVideo ? 'video/mp4' : 'image/jpeg',
        shortcode,
      });

      if (qualities.length === 0) {
        qualities.push({
          label: nodeIsVideo ? 'Full HD Video (MP4)' : 'Original Quality (JPG)',
          downloadUrl: `/api/download?token=${defaultToken}`,
        });
      }

      items.push({
        id: `${shortcode}_${itemIndex}`,
        type: nodeIsVideo ? 'video' : 'photo',
        index: itemIndex,
        previewUrl: nodeIsVideo ? (node.video_url || bestUrl) : (node.display_url || bestUrl),
        downloadUrl: `/api/download?token=${defaultToken}`,
        filename: `instasave_${author.username}_${shortcode}_${itemIndex}.${nodeIsVideo ? 'mp4' : 'jpg'}`,
        width: node.dimensions?.width,
        height: node.dimensions?.height,
        qualities,
      });
    });

    const zipToken = createZipToken({
      shortcode,
      items: items.map((it, idx) => ({
        url: it.qualities[0]?.downloadUrl ? it.qualities[0].downloadUrl : it.downloadUrl,
        filename: `${String(idx + 1).padStart(2, '0')}_${it.type}_${shortcode}.${it.type === 'video' ? 'mp4' : 'jpg'}`,
      })),
    });

    return {
      shortcode,
      originalUrl,
      postType: 'carousel',
      author,
      caption,
      timestamp,
      likesCount,
      commentsCount,
      itemsCount: items.length,
      items,
      zipDownloadUrl: `/api/download-zip?token=${zipToken}`,
    };
  }

  // Single Item (Video or Photo)
  let bestUrl = '';
  const qualities: any[] = [];

  if (isVideo) {
    const videoVersions = media.video_versions || [];
    if (videoVersions.length > 0) {
      bestUrl = videoVersions[0].url;
      videoVersions.forEach((v: any) => {
        const token = createDownloadToken({
          url: v.url,
          filename: `instasave_${author.username}_${shortcode}_${v.height || 'hd'}p.mp4`,
          mimeType: 'video/mp4',
          shortcode,
        });
        qualities.push({
          label: `${v.height ? `${v.height}p HD` : 'High Quality'} (${v.width || ''}x${v.height || ''})`,
          downloadUrl: `/api/download?token=${token}`,
          resolution: `${v.width}x${v.height}`,
        });
      });
    } else {
      bestUrl = media.video_url;
    }
  } else {
    const displayResources = media.display_resources || [];
    if (displayResources.length > 0) {
      const sorted = [...displayResources].sort((a: any, b: any) => (b.config_width || 0) - (a.config_width || 0));
      bestUrl = sorted[0].src;
      sorted.forEach((r: any) => {
        const token = createDownloadToken({
          url: r.src,
          filename: `instasave_${author.username}_${shortcode}_${r.config_width}w.jpg`,
          mimeType: 'image/jpeg',
          shortcode,
        });
        qualities.push({
          label: `${r.config_width}x${r.config_height} High Resolution`,
          downloadUrl: `/api/download?token=${token}`,
          resolution: `${r.config_width}x${r.config_height}`,
        });
      });
    } else {
      bestUrl = media.display_url;
    }
  }

  if (!bestUrl) {
    bestUrl = isVideo ? media.video_url : media.display_url;
  }

  const defaultToken = createDownloadToken({
    url: bestUrl,
    filename: `instasave_${author.username}_${shortcode}.${isVideo ? 'mp4' : 'jpg'}`,
    mimeType: isVideo ? 'video/mp4' : 'image/jpeg',
    shortcode,
  });

  if (qualities.length === 0) {
    qualities.push({
      label: isVideo ? 'Full HD Video (MP4)' : 'Original Resolution (JPG)',
      downloadUrl: `/api/download?token=${defaultToken}`,
    });
  }

  const singleItem: MediaItem = {
    id: `${shortcode}_1`,
    type: isVideo ? 'video' : 'photo',
    index: 1,
    previewUrl: isVideo ? (media.video_url || bestUrl) : (media.display_url || bestUrl),
    downloadUrl: `/api/download?token=${defaultToken}`,
    filename: `instasave_${author.username}_${shortcode}.${isVideo ? 'mp4' : 'jpg'}`,
    width: media.dimensions?.width,
    height: media.dimensions?.height,
    qualities,
  };

  return {
    shortcode,
    originalUrl,
    postType: isVideo ? 'video' : 'photo',
    author,
    caption,
    timestamp,
    likesCount,
    commentsCount,
    itemsCount: 1,
    items: [singleItem],
  };
}

/**
 * Format raw Instagram v1 API item into PostMetadata
 */
function formatInstagramApiItem(item: any, originalUrl: string, shortcode: string): PostMetadata {
  const user = item.user || {};
  const author = {
    username: user.username || 'instagram_user',
    fullName: user.full_name || user.username || 'Instagram User',
    avatarUrl: user.profile_pic_url || '',
    isVerified: Boolean(user.is_verified),
  };

  const caption = item.caption?.text || '';
  const timestamp = item.taken_at ? item.taken_at * 1000 : Date.now();
  const likesCount = item.like_count || 0;
  const commentsCount = item.comment_count || 0;

  const isCarousel = item.media_type === 8 || Boolean(item.carousel_media && item.carousel_media.length > 0);
  const isVideo = item.media_type === 2 || Boolean(item.video_versions && item.video_versions.length > 0);

  // 1. Carousel
  if (isCarousel && item.carousel_media) {
    const items: MediaItem[] = [];

    item.carousel_media.forEach((child: any, index: number) => {
      const childIsVideo = child.media_type === 2 || Boolean(child.video_versions?.length);
      const itemIndex = index + 1;
      let bestUrl = '';
      const qualities: any[] = [];

      if (childIsVideo && child.video_versions?.length > 0) {
        bestUrl = child.video_versions[0].url;
        child.video_versions.forEach((v: any) => {
          const token = createDownloadToken({
            url: v.url,
            filename: `instasave_${author.username}_${shortcode}_${itemIndex}_${v.height || 'hd'}p.mp4`,
            mimeType: 'video/mp4',
            shortcode,
          });
          qualities.push({
            label: `${v.height ? `${v.height}p` : 'HD'} Video (${v.width || ''}x${v.height || ''})`,
            downloadUrl: `/api/download?token=${token}`,
            resolution: `${v.width}x${v.height}`,
          });
        });
      } else {
        const candidates = child.image_versions2?.candidates || [];
        const sorted = [...candidates].sort((a: any, b: any) => (b.width || 0) - (a.width || 0));
        if (sorted.length > 0) {
          bestUrl = sorted[0].url;
          sorted.forEach((c: any) => {
            const token = createDownloadToken({
              url: c.url,
              filename: `instasave_${author.username}_${shortcode}_${itemIndex}_${c.width}w.jpg`,
              mimeType: 'image/jpeg',
              shortcode,
            });
            qualities.push({
              label: `${c.width}x${c.height}px`,
              downloadUrl: `/api/download?token=${token}`,
              resolution: `${c.width}x${c.height}`,
            });
          });
        }
      }

      if (!bestUrl) {
        bestUrl = childIsVideo ? child.video_versions?.[0]?.url : child.image_versions2?.candidates?.[0]?.url;
      }

      const defaultToken = createDownloadToken({
        url: bestUrl,
        filename: `instasave_${author.username}_${shortcode}_${itemIndex}.${childIsVideo ? 'mp4' : 'jpg'}`,
        mimeType: childIsVideo ? 'video/mp4' : 'image/jpeg',
        shortcode,
      });

      if (qualities.length === 0) {
        qualities.push({
          label: childIsVideo ? 'Full HD Video (MP4)' : 'Original Quality (JPG)',
          downloadUrl: `/api/download?token=${defaultToken}`,
        });
      }

      const previewUrl = child.image_versions2?.candidates?.[0]?.url || bestUrl;

      items.push({
        id: `${shortcode}_${itemIndex}`,
        type: childIsVideo ? 'video' : 'photo',
        index: itemIndex,
        previewUrl,
        downloadUrl: `/api/download?token=${defaultToken}`,
        filename: `instasave_${author.username}_${shortcode}_${itemIndex}.${childIsVideo ? 'mp4' : 'jpg'}`,
        width: child.original_width || child.image_versions2?.candidates?.[0]?.width,
        height: child.original_height || child.image_versions2?.candidates?.[0]?.height,
        qualities,
      });
    });

    const zipToken = createZipToken({
      shortcode,
      items: items.map((it, idx) => ({
        url: it.qualities[0]?.downloadUrl ? it.qualities[0].downloadUrl : it.downloadUrl,
        filename: `${String(idx + 1).padStart(2, '0')}_${it.type}_${shortcode}.${it.type === 'video' ? 'mp4' : 'jpg'}`,
      })),
    });

    return {
      shortcode,
      originalUrl,
      postType: 'carousel',
      author,
      caption,
      timestamp,
      likesCount,
      commentsCount,
      itemsCount: items.length,
      items,
      zipDownloadUrl: `/api/download-zip?token=${zipToken}`,
    };
  }

  // 2. Single Video
  if (isVideo) {
    let bestUrl = '';
    const qualities: any[] = [];
    const videoVersions = item.video_versions || [];

    if (videoVersions.length > 0) {
      bestUrl = videoVersions[0].url;
      videoVersions.forEach((v: any) => {
        const token = createDownloadToken({
          url: v.url,
          filename: `instasave_${author.username}_${shortcode}_${v.height || 'hd'}p.mp4`,
          mimeType: 'video/mp4',
          shortcode,
        });
        qualities.push({
          label: `${v.height ? `${v.height}p HD` : 'High Quality'} (${v.width || ''}x${v.height || ''})`,
          downloadUrl: `/api/download?token=${token}`,
          resolution: `${v.width}x${v.height}`,
        });
      });
    }

    const previewUrl = item.image_versions2?.candidates?.[0]?.url || bestUrl;
    const defaultToken = createDownloadToken({
      url: bestUrl,
      filename: `instasave_${author.username}_${shortcode}.mp4`,
      mimeType: 'video/mp4',
      shortcode,
    });

    if (qualities.length === 0) {
      qualities.push({
        label: 'Full HD Video (MP4)',
        downloadUrl: `/api/download?token=${defaultToken}`,
      });
    }

    const singleItem: MediaItem = {
      id: `${shortcode}_1`,
      type: 'video',
      index: 1,
      previewUrl,
      downloadUrl: `/api/download?token=${defaultToken}`,
      filename: `instasave_${author.username}_${shortcode}.mp4`,
      width: item.original_width || videoVersions[0]?.width,
      height: item.original_height || videoVersions[0]?.height,
      qualities,
    };

    return {
      shortcode,
      originalUrl,
      postType: 'video',
      author,
      caption,
      timestamp,
      likesCount,
      commentsCount,
      itemsCount: 1,
      items: [singleItem],
    };
  }

  // 3. Single Photo
  const candidates = item.image_versions2?.candidates || [];
  const sorted = [...candidates].sort((a: any, b: any) => (b.width || 0) - (a.width || 0));
  const bestUrl = sorted[0]?.url || '';
  const qualities: any[] = [];

  sorted.forEach((c: any) => {
    const token = createDownloadToken({
      url: c.url,
      filename: `instasave_${author.username}_${shortcode}_${c.width}w.jpg`,
      mimeType: 'image/jpeg',
      shortcode,
    });
    qualities.push({
      label: `${c.width}x${c.height} High Resolution`,
      downloadUrl: `/api/download?token=${token}`,
      resolution: `${c.width}x${c.height}`,
    });
  });

  const defaultToken = createDownloadToken({
    url: bestUrl,
    filename: `instasave_${author.username}_${shortcode}.jpg`,
    mimeType: 'image/jpeg',
    shortcode,
  });

  if (qualities.length === 0) {
    qualities.push({
      label: 'Original Resolution (JPG)',
      downloadUrl: `/api/download?token=${defaultToken}`,
    });
  }

  const singleItem: MediaItem = {
    id: `${shortcode}_1`,
    type: 'photo',
    index: 1,
    previewUrl: bestUrl,
    downloadUrl: `/api/download?token=${defaultToken}`,
    filename: `instasave_${author.username}_${shortcode}.jpg`,
    width: item.original_width || sorted[0]?.width,
    height: item.original_height || sorted[0]?.height,
    qualities,
  };

  return {
    shortcode,
    originalUrl,
    postType: 'photo',
    author,
    caption,
    timestamp,
    likesCount,
    commentsCount,
    itemsCount: 1,
    items: [singleItem],
  };
}

interface ApiFetchResult {
  status: 'SUCCESS' | 'POST_NOT_FOUND' | 'PRIVATE_ACCOUNT' | 'RATE_LIMITED' | 'UNKNOWN';
  metadata?: PostMetadata;
  rawStatus?: number;
  rawBodySnippet?: string;
  errorMessage?: string;
}

/**
 * Fetch Instagram post info using direct REST API (v1 / media)
 */
async function fetchMediaInfoApi(
  mediaId: string,
  shortcode: string,
  session: InstagramSession,
  originalUrl: string
): Promise<ApiFetchResult> {
  const endpoints = [
    `https://www.instagram.com/api/v1/media/${mediaId}/info/`,
    `https://i.instagram.com/api/v1/media/${mediaId}/info/`,
  ];

  for (const endpoint of endpoints) {
    try {
      const headers: Record<string, string> = {
        'User-Agent': USER_AGENT,
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'X-IG-App-ID': '936619743392459',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': `https://www.instagram.com/p/${shortcode}/`,
      };

      if (session.csrfToken) headers['X-CSRFToken'] = session.csrfToken;
      if (session.cookieHeader) headers['Cookie'] = session.cookieHeader;

      console.log(`[API v1 Request] Fetching media info for ID ${mediaId} (${endpoint})...`);
      const res = await fetch(endpoint, { headers });

      const text = await res.text();
      const snippet = text.substring(0, 500);
      console.log(`[API v1 Raw Response] Status: ${res.status} | Length: ${text.length} | Snippet: ${snippet}`);

      // Check if nonexistent or deleted
      if (
        (res.status === 400 && text.includes('Media not found or unavailable')) ||
        res.status === 404 ||
        text.includes('Page Not Found')
      ) {
        return {
          status: 'POST_NOT_FOUND',
          rawStatus: res.status,
          rawBodySnippet: snippet,
          errorMessage: 'Post Not Found or Deleted',
        };
      }

      // Check if login required or throttled
      if (
        res.status === 429 ||
        res.status === 401 ||
        text.includes('login_required') ||
        text.includes('checkpoint_required') ||
        text.includes('Please wait a few minutes before you try again')
      ) {
        return {
          status: 'RATE_LIMITED',
          rawStatus: res.status,
          rawBodySnippet: snippet,
          errorMessage: 'Service temporarily unavailable, please try again shortly',
        };
      }

      if (res.ok && text.startsWith('{')) {
        const json = JSON.parse(text);
        const item = json.items?.[0];
        if (item) {
          if (item.user?.is_private && !item.image_versions2 && !item.video_versions && !item.carousel_media) {
            return {
              status: 'PRIVATE_ACCOUNT',
              rawStatus: res.status,
              rawBodySnippet: snippet,
              errorMessage: 'This account is private',
            };
          }

          const metadata = formatInstagramApiItem(item, originalUrl, shortcode);
          return {
            status: 'SUCCESS',
            metadata,
            rawStatus: res.status,
            rawBodySnippet: snippet,
          };
        }
      }
    } catch (err: any) {
      console.warn(`[API v1 Endpoint Error] ${endpoint}:`, err?.message);
    }
  }

  return { status: 'UNKNOWN' };
}

/**
 * Main service method to fetch and parse an Instagram post
 */
export async function getPostMetadata(url: string): Promise<FetchPostResponse> {
  // 1. Resolve and validate shortcode
  const parsed = await resolveAndExtractShortcode(url);
  if (!parsed) {
    console.warn(`[getPostMetadata] Rejected malformed URL: ${url}`);
    return {
      success: false,
      error: {
        code: 'INVALID_URL',
        message: 'Please check the link and try again',
      },
    };
  }

  const { shortcode } = parsed;

  // 2. Built-in sample demo shortcodes
  if (SAMPLE_POSTS[shortcode]) {
    console.log(`[getPostMetadata] Serving built-in sample post for "${shortcode}"`);
    return {
      success: true,
      data: buildSampleMetadata(shortcode, shortcode),
    };
  }

  try {
    const mediaId = shortcodeToMediaId(shortcode);

    // 3. Perform Instagram session retrieval (authenticated from env/file or anonymous fallback)
    const session = await fetchInstagramSession();

    // 4. Primary fetch: Direct Instagram API v1 / media info
    const apiResult = await fetchMediaInfoApi(mediaId, shortcode, session, url);

    if (apiResult.status === 'SUCCESS' && apiResult.metadata) {
      console.log(`[getPostMetadata] Successfully fetched post "${shortcode}" via Media Info API`);
      return {
        success: true,
        data: apiResult.metadata,
      };
    }

    if (apiResult.status === 'POST_NOT_FOUND') {
      return {
        success: false,
        error: {
          code: 'POST_NOT_FOUND',
          message: 'Post Not Found or Deleted',
          details: `Instagram returned status ${apiResult.rawStatus}: ${apiResult.rawBodySnippet?.substring(0, 100)}`,
        },
      };
    }

    if (apiResult.status === 'PRIVATE_ACCOUNT') {
      return {
        success: false,
        error: {
          code: 'PRIVATE_ACCOUNT',
          message: 'This account is private',
        },
      };
    }

    // 5. Secondary fetch: Query Instagram GraphQL with retry and backoff
    console.log(`[getPostMetadata] Media Info API returned ${apiResult.status}; trying GraphQL fallback for "${shortcode}"...`);
    const gqlResult = await queryGraphQLWithRetry(shortcode, session);

    // If genuine 404 deleted / nonexistent
    if (gqlResult.status === 'POST_NOT_FOUND') {
      return {
        success: false,
        error: {
          code: 'POST_NOT_FOUND',
          message: 'Post Not Found or Deleted',
          details: `Instagram returned status ${gqlResult.rawStatus}: ${gqlResult.rawBodySnippet?.substring(0, 100)}`,
        },
      };
    }

    // If private account
    if (gqlResult.status === 'PRIVATE_ACCOUNT') {
      return {
        success: false,
        error: {
          code: 'PRIVATE_ACCOUNT',
          message: 'This account is private',
        },
      };
    }

    // If rate-limited / blocked
    if (gqlResult.status === 'RATE_LIMITED') {
      return {
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'Service temporarily unavailable, please try again shortly',
          details: `Instagram response: ${gqlResult.rawBodySnippet?.substring(0, 100)}`,
        },
      };
    }

    // If successful GraphQL data
    if (gqlResult.status === 'SUCCESS' && gqlResult.media) {
      const formatted = formatInstagramMedia(gqlResult.media, url, shortcode);
      return {
        success: true,
        data: formatted,
      };
    }

    // 6. Tertiary Fallback: Check embed page response
    try {
      console.log(`[Fallback Embed Check] Checking embed page for shortcode: ${shortcode}`);
      const embedRes = await fetch(`https://www.instagram.com/p/${shortcode}/embed/captioned/`, {
        headers: { 'User-Agent': USER_AGENT },
      });

      const embedText = await embedRes.text();
      console.log(`[Fallback Embed Response] Status: ${embedRes.status} | Length: ${embedText.length} | Snippet: ${embedText.substring(0, 300)}`);

      // ONLY mark as POST_NOT_FOUND if the page explicitly states Page Not Found or broken link
      if (
        embedText.includes('Page Not Found &bull; Instagram') ||
        embedText.includes('The link you followed may be broken') ||
        (embedRes.status === 404)
      ) {
        console.warn(`[Fallback Embed Check] Confirmed genuinely non-existent post: ${shortcode}`);
        return {
          success: false,
          error: {
            code: 'POST_NOT_FOUND',
            message: 'Post Not Found or Deleted',
          },
        };
      }
    } catch (embedErr) {
      console.warn(`[Fallback Embed Check] Error fetching embed:`, embedErr);
    }

    // If Instagram is blocking or rate limiting server requests,
    // report accurate service unavailable status:
    console.warn(`[Instagram Access Notice] Server request was restricted by Instagram login wall for shortcode: ${shortcode}`);
    return {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Service temporarily unavailable, please try again shortly',
        details: 'Instagram is requiring authentication or throttling automated server requests.',
      },
    };

  } catch (error: any) {
    console.error(`[getPostMetadata Failure] URL: ${url}, Error:`, error);
    return {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Service temporarily unavailable, please try again shortly',
        details: error?.message,
      },
    };
  }
}
