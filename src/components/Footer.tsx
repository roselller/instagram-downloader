import React from 'react';
import { InstagramIcon } from './InstagramIcon';

interface FooterProps {
  onOpenLegal: (tab: 'tos' | 'privacy') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal }) => {
  return (
    <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Compliance / Legal Notice Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-center mb-8">
          <p className="text-xs sm:text-sm font-medium text-amber-800 dark:text-amber-300/90 leading-relaxed">
            <span className="font-bold">⚠️ Legal Disclaimer:</span> For personal use only. Only download content you own or have permission to use. Respect content creators&apos; rights.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg ig-gradient flex items-center justify-center text-white shadow-sm">
              <InstagramIcon className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-base">
              Insta<span className="ig-gradient-text font-black">Save</span>
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-300">
              • Fast HD Instagram Downloader
            </span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => onOpenLegal('tos')}
              className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
            >
              Terms of Service
            </button>
            <button
              onClick={() => onOpenLegal('privacy')}
              className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
            >
              Privacy Policy
            </button>
            <a
              href="#how-it-works"
              className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
            >
              How to Use
            </a>
            <a
              href="#faq"
              className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
            >
              FAQ
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-300">
          <p>
            © {new Date().getFullYear()} InstaSave. All rights reserved.
          </p>
          <p className="text-center sm:text-right">
            InstaSave is not affiliated with, endorsed, or sponsored by Instagram™ or Meta Platforms, Inc.
          </p>
        </div>
      </div>
    </footer>
  );
};
