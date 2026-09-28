'use client';

import React, { useState, useRef } from 'react';
import { Clipboard, ArrowRight, Loader2, X, Link as LinkIcon, Sparkles } from 'lucide-react';

interface HeroInputProps {
  url: string;
  setUrl: (url: string) => void;
  onSubmit: (urlToSubmit?: string) => void;
  isLoading: boolean;
  onClear: () => void;
}

export const HeroInput: React.FC<HeroInputProps> = ({
  url,
  setUrl,
  onSubmit,
  isLoading,
  onClear,
}) => {
  const [pasteFeedback, setPasteFeedback] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        setPasteFeedback(true);
        setTimeout(() => setPasteFeedback(false), 1500);
        // Focus input after pasting
        inputRef.current?.focus();
      }
    } catch (err) {
      console.warn('Clipboard read failed:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault();
      onSubmit();
    }
  };

  const sampleButtons = [
    { label: '🎬 Sample Reel', url: 'https://www.instagram.com/reel/sample_reel/' },
    { label: '📚 Sample Carousel (.zip)', url: 'https://www.instagram.com/p/sample_carousel/' },
    { label: '🌌 Sample Photo (HD)', url: 'https://www.instagram.com/p/sample_photo/' },
  ];

  return (
    <section className="pt-10 pb-8 px-4 sm:px-6 max-w-4xl mx-auto text-center">
      {/* Badge */}
      <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 border border-pink-200/60 dark:border-pink-800/40 mb-6 shadow-sm">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Free & Unlimited Instagram Downloader</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
        Download Instagram <br className="hidden sm:inline" />
        <span className="ig-gradient-text">Posts, Reels & Carousels</span>
      </h1>

      {/* Subhead */}
      <p className="mt-3.5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal">
        Save photos, videos, and full carousels in the highest quality available. 
        Fast, free, and no account or app required.
      </p>

      {/* Main Input Form */}
      <div className="mt-8 max-w-2xl mx-auto">
        <div className="relative flex flex-col sm:flex-row items-center gap-2 p-1.5 sm:p-2 rounded-2xl bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-black/40 border border-slate-200 dark:border-slate-800 focus-within:ring-2 focus-within:ring-pink-500/50 focus-within:border-pink-500 transition-all">
          <div className="relative flex-1 w-full flex items-center pl-3">
            <LinkIcon className="w-5 h-5 text-slate-600 dark:text-slate-300 shrink-0" />
            
            <input
              ref={inputRef}
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste Instagram link here (/p/, /reel/, /tv/)..."
              disabled={isLoading}
              className="w-full py-3.5 pl-3 pr-20 text-sm sm:text-base bg-transparent text-slate-900 dark:text-white placeholder-slate-600 dark:placeholder-slate-400 focus:outline-none"
            />

            {/* Clear Button */}
            {url && (
              <button
                type="button"
                onClick={onClear}
                disabled={isLoading}
                aria-label="Clear input"
                className="absolute right-12 p-1 rounded-full text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Paste Button */}
            <button
              type="button"
              onClick={handlePaste}
              disabled={isLoading}
              title="Paste from clipboard"
              className="absolute right-2 p-2 rounded-lg text-slate-600 hover:text-pink-600 dark:text-slate-300 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1"
            >
              <Clipboard className="w-4 h-4" />
              <span className="text-xs font-semibold hidden md:inline">
                {pasteFeedback ? 'Pasted!' : 'Paste'}
              </span>
            </button>
          </div>

          {/* Prominent Download Button */}
          <button
            type="button"
            onClick={() => onSubmit()}
            disabled={isLoading || !url.trim()}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl ig-gradient ig-gradient-hover text-white font-semibold text-sm sm:text-base flex items-center justify-center space-x-2 shadow-md shadow-pink-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-50 transition-all duration-200 shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Fetching...</span>
              </>
            ) : (
              <>
                <span>Download</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Quick sample pills */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-600 dark:text-slate-300 font-medium">
            Try a demo:
          </span>
          {sampleButtons.map((btn) => (
            <button
              key={btn.label}
              onClick={() => {
                setUrl(btn.url);
                onSubmit(btn.url);
              }}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors font-medium cursor-pointer"
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
