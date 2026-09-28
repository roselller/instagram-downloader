import React from 'react';
import { DownloadCloud } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div className="flex items-center space-x-3 px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-xl border border-slate-700 dark:border-slate-200 text-xs sm:text-sm font-medium">
        <div className="w-7 h-7 rounded-xl ig-gradient flex items-center justify-center text-white shrink-0 shadow-sm">
          <DownloadCloud className="w-4 h-4" />
        </div>
        <div className="max-w-[280px] truncate">
          <span className="font-bold">Download Started:</span> {message}
        </div>
      </div>
    </div>
  );
};
