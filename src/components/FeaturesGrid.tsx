'use client';

import React from 'react';
import { Sparkles, Archive, ShieldCheck, Zap, MonitorSmartphone, DownloadCloud } from 'lucide-react';

export const FeaturesGrid: React.FC = () => {
  const features = [
    {
      title: 'Highest Quality HD & 4K',
      desc: 'Always extracts the original, uncompressed source files from Instagram servers for crisp photos and crystal-clear 1080p MP4 videos.',
      icon: <Sparkles className="w-5 h-5 text-amber-500" />,
    },
    {
      title: 'Carousel ZIP Bundling',
      desc: 'Download all photos and videos from multi-slide carousel albums in a single click packed neatly into a .zip archive.',
      icon: <Archive className="w-5 h-5 text-purple-500" />,
    },
    {
      title: 'Direct Proxy Downloads',
      desc: 'Downloads start immediately on your device with correct filenames and extensions. No CORS errors and no redirecting to Instagram tabs.',
      icon: <DownloadCloud className="w-5 h-5 text-pink-500" />,
    },
    {
      title: '100% Anonymous & Free',
      desc: 'No registration, no password, and no login required. Download without ever exposing your personal Instagram credentials.',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
    },
    {
      title: 'Lightning Fast Speeds',
      desc: 'Instant metadata parsing in under 2 seconds and streaming downloads directly without bottlenecking server storage.',
      icon: <Zap className="w-5 h-5 text-blue-500" />,
    },
    {
      title: 'Mobile-First Responsive',
      desc: 'Optimized for seamless operation across iPhone (Safari), Android (Chrome), tablets, and desktop web browsers.',
      icon: <MonitorSmartphone className="w-5 h-5 text-indigo-500" />,
    },
  ];

  return (
    <section id="features" className="py-16 px-4 sm:px-6 max-w-5xl mx-auto border-t border-slate-200/60 dark:border-slate-800/60">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Why Choose InstaSave?
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
          The cleanest, most reliable way to save Instagram content with zero clutter.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              {f.icon}
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              {f.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
