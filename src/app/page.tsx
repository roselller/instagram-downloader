'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroInput } from '@/components/HeroInput';
import { ErrorAlert } from '@/components/ErrorAlert';
import { PreviewSkeleton } from '@/components/PreviewSkeleton';
import { PreviewCard } from '@/components/PreviewCard';
import { HowToGuide } from '@/components/HowToGuide';
import { FeaturesGrid } from '@/components/FeaturesGrid';
import { FaqSection } from '@/components/FaqSection';
import { Footer } from '@/components/Footer';
import { LegalModal } from '@/components/LegalModal';
import { Toast } from '@/components/Toast';
import { PostMetadata, FetchPostErrorCode, FetchPostResponse } from '@/lib/types';

export default function Home() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [metadata, setMetadata] = useState<PostMetadata | null>(null);
  const [error, setError] = useState<{ code: FetchPostErrorCode; message: string } | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<'tos' | 'privacy'>('tos');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize theme from system or localStorage
  useEffect(() => {
    const isDark =
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleToggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  const handleFetchPost = async (urlToFetch?: string) => {
    const targetUrl = (urlToFetch || url).trim();
    if (!targetUrl) return;

    setError(null);
    setMetadata(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/fetch-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data: FetchPostResponse = await res.json();

      if (!res.ok || !data.success || !data.data) {
        setError({
          code: data.error?.code || 'FETCH_ERROR',
          message: data.error?.message || 'Could not fetch this post. Please verify the URL or try again later.',
        });
      } else {
        setMetadata(data.data);
      }
    } catch {
      setError({
        code: 'FETCH_ERROR',
        message: 'Network error or server unreachable. Please check your connection and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setUrl('');
    setError(null);
    setMetadata(null);
  };

  const handleDownloadStarted = (filename: string) => {
    setToastMessage(filename);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleOpenLegal = (tab: 'tos' | 'privacy') => {
    setLegalTab(tab);
    setLegalModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors selection:bg-pink-500 selection:text-white">
      {/* Navigation */}
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenLegal={handleOpenLegal}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero & Input */}
        <HeroInput
          url={url}
          setUrl={setUrl}
          onSubmit={handleFetchPost}
          isLoading={isLoading}
          onClear={handleClear}
        />

        {/* Error Alert */}
        {error && (
          <ErrorAlert
            code={error.code}
            message={error.message}
            onRetry={() => handleFetchPost()}
          />
        )}

        {/* Loading Skeleton */}
        {isLoading && <PreviewSkeleton />}

        {/* Preview & Download Card */}
        {metadata && !isLoading && (
          <PreviewCard
            metadata={metadata}
            onDownloadStarted={handleDownloadStarted}
          />
        )}

        {/* How It Works Guide */}
        <HowToGuide />

        {/* Features Showcase */}
        <FeaturesGrid />

        {/* FAQs */}
        <FaqSection />
      </main>

      {/* Footer */}
      <Footer onOpenLegal={handleOpenLegal} />

      {/* Legal Dialog Modal */}
      <LegalModal
        isOpen={legalModalOpen}
        activeTab={legalTab}
        onClose={() => setLegalModalOpen(false)}
        onSelectTab={(tab) => setLegalTab(tab)}
      />

      {/* Download Alert Toast */}
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}
