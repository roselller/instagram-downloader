'use client';

import React from 'react';
import { X, Shield, FileText } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  activeTab: 'tos' | 'privacy';
  onClose: () => void;
  onSelectTab: (tab: 'tos' | 'privacy') => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  activeTab,
  onClose,
  onSelectTab,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onSelectTab('tos')}
              className={`px-3 py-1.5 rounded-xl text-sm font-bold flex items-center space-x-1.5 transition-colors ${
                activeTab === 'tos'
                  ? 'bg-slate-100 dark:bg-slate-800 text-pink-600 dark:text-pink-400'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Terms of Service</span>
            </button>
            <button
              onClick={() => onSelectTab('privacy')}
              className={`px-3 py-1.5 rounded-xl text-sm font-bold flex items-center space-x-1.5 transition-colors ${
                activeTab === 'privacy'
                  ? 'bg-slate-100 dark:bg-slate-800 text-pink-600 dark:text-pink-400'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Privacy Policy</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {activeTab === 'tos' ? (
            <>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Terms of Service & Acceptable Use Policy
              </h3>
              <p>
                Welcome to InstaSave. By accessing or utilizing this website, you agree to comply with and be bound by the following Terms of Service. If you do not agree to these terms, please do not use our service.
              </p>

              <h4 className="font-semibold text-slate-900 dark:text-white pt-2">
                1. Personal & Non-Commercial Use
              </h4>
              <p>
                InstaSave is provided solely for personal, non-commercial archival and offline viewing purposes. You are strictly responsible for ensuring that you have the legal right, authorization, or fair use permission to access and download any media using this tool.
              </p>

              <h4 className="font-semibold text-slate-900 dark:text-white pt-2">
                2. Intellectual Property & Copyright
              </h4>
              <p>
                All trademarks, copyrights, and intellectual property rights related to Instagram content belong to their respective creators and owners. InstaSave does not claim ownership or licensing rights to any downloaded content. We strongly encourage users to respect intellectual property rights and never redistribute or monetize downloaded media without authorization.
              </p>

              <h4 className="font-semibold text-slate-900 dark:text-white pt-2">
                3. Disclaimer of Affiliation
              </h4>
              <p>
                InstaSave is an independent web application and is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Instagram, Meta Platforms, Inc., or any of their subsidiaries or affiliates.
              </p>

              <h4 className="font-semibold text-slate-900 dark:text-white pt-2">
                4. DMCA / Content Removal
              </h4>
              <p>
                InstaSave does not host or store any media files on its servers. All media is fetched and streamed ephemerally on request directly from public content delivery networks. If you are a copyright owner and wish to request restrictions, please contact the original hosting platform or our team.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Privacy Policy
              </h3>
              <p>
                Your privacy is paramount. InstaSave is intentionally built with a zero-retention architecture.
              </p>

              <h4 className="font-semibold text-slate-900 dark:text-white pt-2">
                1. No Account or Registration Required
              </h4>
              <p>
                You can use InstaSave completely anonymously. We never ask for your name, email address, password, phone number, or social media login credentials.
              </p>

              <h4 className="font-semibold text-slate-900 dark:text-white pt-2">
                2. No Persistent Storage of Media
              </h4>
              <p>
                We do NOT store or archive any photos, videos, or audio downloaded through this tool. All downloads and ZIP bundles are processed in transient server memory and streamed directly to your browser session. Once the download completes, no trace remains on our servers.
              </p>

              <h4 className="font-semibold text-slate-900 dark:text-white pt-2">
                3. Logging & Analytics
              </h4>
              <p>
                We do not maintain user access logs associating IP addresses with requested URLs. Temporary session tokens expire automatically after two hours.
              </p>

              <h4 className="font-semibold text-slate-900 dark:text-white pt-2">
                4. Cookies
              </h4>
              <p>
                We only use local storage to remember your chosen theme preference (Light or Dark mode). No tracking or third-party advertising cookies are employed.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
