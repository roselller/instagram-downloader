import React from 'react';
import { Copy, ArrowDownCircle, HardDrive } from 'lucide-react';

export const HowToGuide: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Copy Post Link',
      desc: 'Open Instagram app or website, navigate to any public post, reel, or carousel, tap the Share icon (paper airplane or three dots), and select "Copy link".',
      icon: <Copy className="w-6 h-6 text-pink-500" />,
    },
    {
      num: '02',
      title: 'Paste into InstaSave',
      desc: 'Paste the copied URL into the search box above. Click the "Paste" button or press Enter to fetch the post details.',
      icon: <ArrowDownCircle className="w-6 h-6 text-purple-500" />,
    },
    {
      num: '03',
      title: 'Direct High-Quality Download',
      desc: 'Preview the media, select your preferred resolution (HD / SD), or download all carousel slides in a single .zip file directly to your device.',
      icon: <HardDrive className="w-6 h-6 text-orange-500" />,
    },
  ];

  return (
    <section id="how-it-works" className="py-16 px-4 sm:px-6 max-w-5xl mx-auto border-t border-slate-200/60 dark:border-slate-800/60">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          How to Download from Instagram
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
          Save your favorite public Instagram videos and photos in three simple steps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {steps.map((step) => (
          <div
            key={step.num}
            className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-pink-50 dark:bg-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                {step.icon}
              </div>
              <span className="text-3xl font-black text-slate-200 dark:text-slate-800">
                {step.num}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {step.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
