'use client';

import React from 'react';
import { AlertCircle, Lock, FileQuestion, Clock, RefreshCw } from 'lucide-react';
import { FetchPostErrorCode } from '@/lib/types';

interface ErrorAlertProps {
  code: FetchPostErrorCode;
  message: string;
  onRetry?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ code, message, onRetry }) => {
  const getErrorConfig = () => {
    switch (code) {
      case 'INVALID_URL':
        return {
          icon: <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />,
          title: 'Please check the link and try again',
          advice: 'Supported formats include: instagram.com/p/..., /reel/..., /reels/..., /tv/..., and mobile share links.',
          bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200',
        };
      case 'PRIVATE_ACCOUNT':
        return {
          icon: <Lock className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />,
          title: 'This account is private',
          advice: 'Media from private profiles cannot be retrieved or downloaded without authentication.',
          bg: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200',
        };
      case 'POST_NOT_FOUND':
        return {
          icon: <FileQuestion className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />,
          title: 'Post Not Found or Deleted',
          advice: 'The requested post does not exist or may have been permanently removed by its owner.',
          bg: 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200',
        };
      case 'RATE_LIMITED':
        return {
          icon: <Clock className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />,
          title: 'Service temporarily unavailable, please try again shortly',
          advice: 'Instagram is temporarily limiting unauthenticated requests. You can also try one of our instant sample posts below.',
          bg: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/50 text-orange-900 dark:text-orange-200',
        };
      default:
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />,
          title: 'Unable to Fetch Post',
          advice: 'An error occurred while communicating with Instagram servers. Please try again shortly.',
          bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-200',
        };
    }
  };

  const config = getErrorConfig();

  return (
    <div className="max-w-2xl mx-auto px-4 mb-8">
      <div className={`p-4 rounded-xl border flex items-start space-x-3.5 shadow-sm ${config.bg}`}>
        {config.icon}
        <div className="flex-1 text-left">
          <h3 className="text-sm font-semibold tracking-tight">{config.title}</h3>
          <p className="mt-1 text-xs opacity-90 leading-relaxed">{message}</p>
          <p className="mt-1.5 text-xs opacity-75">{config.advice}</p>

          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center space-x-1.5 text-xs font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
