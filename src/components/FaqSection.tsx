'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      q: 'Is InstaSave free to use?',
      a: 'Yes, InstaSave is 100% free with unlimited downloads. You do not need to register, create an account, or install any software or browser extensions.',
    },
    {
      q: 'How does the Carousel ZIP download work?',
      a: 'When you fetch an Instagram post that contains multiple photos and videos (a carousel / sidecar album), InstaSave gives you the option to download each item individually or click "Download All (.zip)". Our server packages all media items into a clean zip archive on the fly and streams it directly to your device.',
    },
    {
      q: 'Can I download videos from private accounts?',
      a: 'No. InstaSave respects privacy laws and only works with publicly accessible Instagram posts. Content from accounts set to private cannot be retrieved without logging in.',
    },
    {
      q: 'Where are the downloaded files saved on my device?',
      a: 'On desktop computers (Mac/Windows), downloaded files are typically placed in your default "Downloads" folder. On iPhone and iPad (Safari), you will see a download arrow in the address bar where you can save to the Files app or Photos. On Android (Chrome), files are saved directly to your Downloads directory.',
    },
    {
      q: 'Does InstaSave store my downloaded files or keep logs?',
      a: 'No. InstaSave does not store any downloaded photos, videos, or user data on its servers. All media downloads are proxied through ephemeral streams in real-time. Once the transfer completes, no copies or logs remain.',
    },
    {
      q: 'Is it legal to download Instagram videos?',
      a: 'Downloading public content for personal, offline viewing is generally permissible under fair use in many jurisdictions. However, you should never redistribute, monetize, or republish copyrighted media without explicit permission from the original creator.',
    },
  ];

  return (
    <section id="faq" className="py-16 px-4 sm:px-6 max-w-4xl mx-auto border-t border-slate-200/60 dark:border-slate-800/60">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
          Everything you need to know about downloading Instagram content.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-all shadow-sm"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between font-bold text-slate-900 dark:text-white text-base hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-600 transition-transform duration-200 shrink-0 ml-4 ${
                    isOpen ? 'rotate-180 text-pink-600 dark:text-pink-400' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
