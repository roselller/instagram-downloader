import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "InstaSave — Fast Instagram Video, Reels & Photo Downloader in HD",
  description: "Download Instagram videos, reels, photos, and multi-slide carousels in the highest quality available. Free, fast, and no login required.",
  keywords: ["instagram downloader", "download instagram reels", "instagram carousel zip download", "instagram photo download", "instasave", "fastdl"],
  authors: [{ name: "InstaSave" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
