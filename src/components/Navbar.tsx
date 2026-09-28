'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { InstagramIcon } from './InstagramIcon';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenLegal: (tab: 'tos' | 'privacy') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenLegal,
}) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center space-x-2.5 group">
          <div className="w-10 h-10 rounded-xl ig-gradient flex items-center justify-center text-white shadow-md shadow-pink-500/20 group-hover:scale-105 transition-transform">
            <InstagramIcon className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white">
              Insta<span className="ig-gradient-text font-extrabold">Save</span>
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-600 dark:text-slate-300">
              HD Media Downloader
            </span>
          </div>
        </a>

        {/* Navigation links & Theme Toggle */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#how-it-works" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              How to Use
            </a>
            <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Features
            </a>
            <a href="#faq" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              FAQ
            </a>
            <button
              onClick={() => onOpenLegal('tos')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Terms
            </button>
          </nav>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-amber-400 animate-in fade-in duration-200" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600 animate-in fade-in duration-200" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
