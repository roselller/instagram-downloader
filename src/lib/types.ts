export type PostType = 'photo' | 'video' | 'carousel';

export interface MediaItemQuality {
  label: string;
  downloadUrl: string;
  resolution?: string;
  width?: number;
  height?: number;
}

export interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  index: number;
  previewUrl: string; // Proxied preview or safe URL
  downloadUrl: string; // Proxied download link
  filename: string;
  width?: number;
  height?: number;
  qualities: MediaItemQuality[];
}

export interface PostAuthor {
  username: string;
  fullName: string;
  avatarUrl?: string;
  isVerified?: boolean;
}

export interface PostMetadata {
  shortcode: string;
  originalUrl: string;
  postType: PostType;
  author: PostAuthor;
  caption: string;
  timestamp?: number;
  likesCount?: number;
  commentsCount?: number;
  itemsCount: number;
  items: MediaItem[];
  zipDownloadUrl?: string; // If carousel
}

export type FetchPostErrorCode = 
  | 'INVALID_URL'
  | 'PRIVATE_ACCOUNT'
  | 'POST_NOT_FOUND'
  | 'RATE_LIMITED'
  | 'FETCH_ERROR';

export interface FetchPostResponse {
  success: boolean;
  data?: PostMetadata;
  error?: {
    code: FetchPostErrorCode;
    message: string;
    details?: string;
  };
}
