'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export const PreviewSkeleton: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 mb-16 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header skeleton */}
        <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="space-y-2">
              <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              <div className="w-20 h-3 bg-slate-100 dark:bg-slate-800/60 rounded animate-pulse" />
            </div>
          </div>
          <div className="w-24 h-7 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>

        {/* Media stage skeleton */}
        <div className="h-[360px] sm:h-[460px] bg-slate-950/60 flex flex-col items-center justify-center relative">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-300">
            Fetching Instagram post metadata...
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Retrieving highest resolution media stream
          </p>
        </div>

        {/* Caption skeleton */}
        <div className="p-5 space-y-2.5 border-b border-slate-100 dark:border-slate-800">
          <div className="w-full h-3.5 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="w-3/4 h-3.5 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </div>

        {/* Footer actions skeleton */}
        <div className="p-5 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-48 h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="w-36 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
};
