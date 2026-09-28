'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useState } from 'react';
import { 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  Film, 
  Image as ImageIcon, 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  Archive, 
  Heart, 
  MessageCircle, 
  LayoutGrid, 
  SlidersHorizontal
} from 'lucide-react';
import { PostMetadata, MediaItem } from '@/lib/types';

interface PreviewCardProps {
  metadata: PostMetadata;
  onDownloadStarted?: (filename: string) => void;
}

export const PreviewCard: React.FC<PreviewCardProps> = ({ metadata, onDownloadStarted }) => {
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<'slider' | 'grid'>('slider');
  const [isZipping, setIsZipping] = useState(false);
  const [downloadingItem, setDownloadingItem] = useState<string | null>(null);

  const currentItem: MediaItem = metadata.items[activeItemIndex] || metadata.items[0];
  const isCarousel = metadata.postType === 'carousel' || metadata.items.length > 1;

  // Handle direct file download
  const handleDownload = (downloadUrl: string, filename: string) => {
    setDownloadingItem(filename);
    onDownloadStarted?.(filename);

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      setDownloadingItem(null);
    }, 2000);
  };

  // Handle carousel ZIP download
  const handleDownloadZip = () => {
    if (!metadata.zipDownloadUrl) return;
    setIsZipping(true);
    const zipName = `instasave_${metadata.shortcode}_carousel.zip`;
    onDownloadStarted?.(zipName);

    const a = document.createElement('a');
    a.href = metadata.zipDownloadUrl;
    a.download = zipName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      setIsZipping(false);
    }, 3000);
  };

  const formattedDate = metadata.timestamp 
    ? new Date(metadata.timestamp).toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }) 
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-slate-200/60 dark:shadow-black/60 border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        
        {/* Header: Author & Metadata */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            <div className="relative">
              <div className="w-11 h-11 rounded-full p-0.5 ig-gradient">
                <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 p-0.5 overflow-hidden">
                  {metadata.author.avatarUrl ? (
                    <img
                      src={metadata.author.avatarUrl}
                      alt={metadata.author.username}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-sm">
                      {metadata.author.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Names & Date */}
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                  @{metadata.author.username}
                </span>
                {metadata.author.isVerified && (
                  <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500 text-white" />
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                <span>{metadata.author.fullName || metadata.author.username}</span>
                {formattedDate && (
                  <>
                    <span>•</span>
                    <span>{formattedDate}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Badges & Open Original */}
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
              {metadata.postType === 'video' ? (
                <>
                  <Film className="w-3.5 h-3.5 text-pink-500" />
                  <span>Reel / Video</span>
                </>
              ) : metadata.postType === 'carousel' ? (
                <>
                  <Layers className="w-3.5 h-3.5 text-purple-500" />
                  <span>Carousel ({metadata.itemsCount})</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                  <span>Photo</span>
                </>
              )}
            </span>

            <a
              href={metadata.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="View on Instagram"
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Media Preview Stage */}
        <div className="relative bg-slate-950 flex items-center justify-center min-h-[320px] sm:min-h-[460px] max-h-[620px] overflow-hidden">
          {viewMode === 'slider' || !isCarousel ? (
            <div className="w-full h-full flex items-center justify-center relative">
              {currentItem.type === 'video' ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <video
                    key={currentItem.previewUrl}
                    src={currentItem.previewUrl}
                    controls
                    playsInline
                    className="max-h-[580px] w-auto max-w-full rounded-md object-contain"
                  />
                </div>
              ) : (
                <img
                  key={currentItem.previewUrl}
                  src={currentItem.previewUrl}
                  alt={`Post item ${activeItemIndex + 1}`}
                  className="max-h-[580px] w-auto max-w-full object-contain"
                />
              )}

              {/* Carousel Next / Prev Controls */}
              {isCarousel && (
                <>
                  <button
                    onClick={() => setActiveItemIndex((prev) => (prev > 0 ? prev - 1 : metadata.items.length - 1))}
                    aria-label="Previous item"
                    className="absolute left-3 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-all hover:scale-105 shadow-md"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveItemIndex((prev) => (prev < metadata.items.length - 1 ? prev + 1 : 0))}
                    aria-label="Next item"
                    className="absolute right-3 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-all hover:scale-105 shadow-md"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Item Index Badge */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-semibold tracking-wide">
                    {activeItemIndex + 1} / {metadata.items.length}
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Grid View for Carousel */
            <div className="w-full p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[560px] overflow-y-auto">
              {metadata.items.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setActiveItemIndex(idx);
                    setViewMode('slider');
                  }}
                  className="relative group cursor-pointer aspect-square rounded-xl overflow-hidden bg-slate-900 border-2 transition-all hover:opacity-95 border-transparent hover:border-pink-500"
                >
                  <img
                    src={item.previewUrl}
                    alt={`Slide ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-[11px] font-semibold text-white">
                    #{idx + 1}
                  </div>
                  {item.type === 'video' && (
                    <div className="absolute bottom-2 right-2 p-1 rounded-full bg-black/70 text-white">
                      <Film className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Carousel Thumbnail Strip & View Mode Switcher */}
        {isCarousel && (
          <div className="p-3 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl bg-slate-200/80 dark:bg-slate-800 p-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <button
                onClick={() => setViewMode('slider')}
                className={`px-2.5 py-1 rounded-lg flex items-center space-x-1.5 transition-colors ${
                  viewMode === 'slider'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Slider</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1 rounded-lg flex items-center space-x-1.5 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
            </div>

            {/* Thumbnail dots/images */}
            <div className="flex items-center space-x-1.5 overflow-x-auto py-1 max-w-[60%] scrollbar-none">
              {metadata.items.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveItemIndex(index);
                    setViewMode('slider');
                  }}
                  className={`relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                    activeItemIndex === index && viewMode === 'slider'
                      ? 'border-pink-500 scale-105 shadow-sm'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Quick All ZIP button */}
            {metadata.zipDownloadUrl && (
              <button
                onClick={handleDownloadZip}
                disabled={isZipping}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm shrink-0 transition-colors"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>{isZipping ? 'Bundling ZIP...' : 'Download All (.zip)'}</span>
              </button>
            )}
          </div>
        )}

        {/* Post Caption & Engagement */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
          {metadata.caption && (
            <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
              <span className="font-bold mr-1.5 text-slate-900 dark:text-white">
                @{metadata.author.username}
              </span>
              <span>
                {isCaptionExpanded || metadata.caption.length <= 160
                  ? metadata.caption
                  : `${metadata.caption.slice(0, 160)}...`}
              </span>
              {metadata.caption.length > 160 && (
                <button
                  onClick={() => setIsCaptionExpanded(!isCaptionExpanded)}
                  className="ml-2 font-semibold text-pink-600 dark:text-pink-400 hover:underline text-xs"
                >
                  {isCaptionExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          )}

          {/* Likes & Comments stats */}
          {(metadata.likesCount !== undefined || metadata.commentsCount !== undefined) && (
            <div className="mt-3 flex items-center space-x-4 text-xs font-medium text-slate-600 dark:text-slate-300">
              {metadata.likesCount !== undefined && metadata.likesCount > 0 && (
                <div className="flex items-center space-x-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                  <span>{metadata.likesCount.toLocaleString()} likes</span>
                </div>
              )}
              {metadata.commentsCount !== undefined && metadata.commentsCount > 0 && (
                <div className="flex items-center space-x-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
                  <span>{metadata.commentsCount.toLocaleString()} comments</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Download Actions Footer */}
        <div className="p-4 sm:p-6 bg-slate-50/70 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left w-full sm:w-auto">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-600 dark:text-slate-300">
              {isCarousel
                ? `Item ${activeItemIndex + 1} of ${metadata.items.length} (${currentItem.type})`
                : `${metadata.postType === 'video' ? 'Video' : 'Photo'} Quality Options`}
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Downloaded via secure proxy directly to your device
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
            {/* If Carousel, offer ZIP download */}
            {isCarousel && metadata.zipDownloadUrl && (
              <button
                onClick={handleDownloadZip}
                disabled={isZipping}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold text-sm flex items-center justify-center space-x-2 shadow-sm transition-all"
              >
                <Archive className="w-4 h-4" />
                <span>{isZipping ? 'Generating .ZIP...' : `Download All ${metadata.items.length} Items (.zip)`}</span>
              </button>
            )}

            {/* Individual Item Download (with quality options) */}
            {currentItem.qualities && currentItem.qualities.length > 1 ? (
              currentItem.qualities.map((q, qIdx) => (
                <button
                  key={qIdx}
                  onClick={() => handleDownload(q.downloadUrl, currentItem.filename)}
                  disabled={downloadingItem === currentItem.filename}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl ig-gradient ig-gradient-hover text-white font-semibold text-sm flex items-center justify-center space-x-2 shadow-md shadow-pink-500/20 transition-all hover:scale-[1.02]"
                >
                  <Download className="w-4 h-4" />
                  <span>{downloadingItem === currentItem.filename ? 'Downloading...' : q.label}</span>
                </button>
              ))
            ) : (
              <button
                onClick={() => handleDownload(currentItem.downloadUrl, currentItem.filename)}
                disabled={downloadingItem === currentItem.filename}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl ig-gradient ig-gradient-hover text-white font-semibold text-sm flex items-center justify-center space-x-2 shadow-md shadow-pink-500/20 transition-all hover:scale-[1.02]"
              >
                <Download className="w-4 h-4" />
                <span>
                  {downloadingItem === currentItem.filename
                    ? 'Downloading...'
                    : currentItem.type === 'video'
                    ? 'Download HD Video'
                    : 'Download HD Photo'}
                </span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
