# InstaSave — High-Quality Instagram Media Downloader

A fast, minimalist single-page web application inspired by **fastdl.app** that lets users download Instagram posts, reels, photos, and multi-slide carousels in the highest available quality by pasting a public post URL.

---

## ✨ Features

- **Multi-Format Support:** Accepts and validates `/p/`, `/reel/`, `/reels/`, and `/tv/` URLs (with or without query parameters or mobile prefixes like `m.instagram.com`).
- **High Definition (HD / 4K):** Automatically extracts the highest resolution source files from metadata with selectable quality tiers (e.g. 1080p Full HD vs 720p HD).
- **Carousel ZIP Bundling:** Multi-item carousels can be downloaded item-by-item or downloaded **all at once as a `.zip` archive** generated on the fly.
- **Secure Backend Streaming Proxy:**
  - Raw Instagram CDN URLs and scraping logic are **never exposed** to the client.
  - Generates encrypted, time-limited AES-256 tokens (`/api/download?token=...` and `/api/download-zip?token=...`).
  - Sets `Content-Disposition: attachment; filename="..."` so files download directly to the user's device instead of opening in a new browser tab.
  - Bypasses cross-origin CORS limitations cleanly.
- **Zero Persistent Storage:** Zero user data or downloaded media is retained on the server. All downloads are streamed ephemerally.
- **Ultra-Fast & Responsive (<3s):** Mobile-first design with skeleton loaders, clipboard paste detection (`navigator.clipboard.readText()`), dark/light mode toggle, and smooth Instagram radiant gradients.
- **Interactive Demos:** Built-in demo post buttons ("Try Sample Reel", "Try Sample Carousel (.zip)", "Try Sample Photo") for instant 1-click evaluation.
- **Legal Compliance & Disclaimer:** Prominent compliance notices, acceptable use Terms of Service modal, Privacy Policy modal, and non-affiliation disclosures.

---

## 🛠 Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Backend API Routes:**
  - `POST /api/fetch-post` — Multi-tiered Instagram scraper & metadata parser with anonymous GraphQL session fallback cascade
  - `GET /api/download` — Media proxy stream with attachment headers and mime-type handling
  - `GET /api/download-zip` — On-the-fly streaming ZIP generator using `JSZip`
- **Security & Tokens:** `crypto` (AES-256-GCM authenticated encryption for URL masking and expiration)

---

## 🚀 Getting Started

### 1. Installation

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build & Run for Production

```bash
npm run build
npm run start
```

---

## 🧪 Automated Testing

InstaSave includes a comprehensive end-to-end test suite testing homepage rendering, invalid URL rejection, reel metadata parsing, direct video streaming, high-res photo downloads, and carousel ZIP archive generation.

With the server running on `http://localhost:3000`:

```bash
node tests/e2e.test.mjs
```

---

## 📋 API Specifications

### `POST /api/fetch-post`
Fetches and parses public Instagram post metadata.

**Request:**
```json
{
  "url": "https://www.instagram.com/reel/C8xYzDemo1/"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "shortcode": "C8xYzDemo1",
    "postType": "video",
    "author": {
      "username": "earthpix",
      "fullName": "Earth Pix",
      "avatarUrl": "https://...",
      "isVerified": true
    },
    "caption": "Breathtaking sunset over the Swiss Alps...",
    "itemsCount": 1,
    "items": [
      {
        "id": "C8xYzDemo1_1",
        "type": "video",
        "previewUrl": "https://...",
        "downloadUrl": "/api/download?token=...",
        "filename": "instasave_earthpix_C8xYzDemo1.mp4",
        "qualities": [
          { "label": "1080p Full HD", "downloadUrl": "/api/download?token=..." },
          { "label": "720p HD", "downloadUrl": "/api/download?token=..." }
        ]
      }
    ]
  }
}
```

### `GET /api/download?token=<token>`
Streams binary media directly with:
```http
Content-Disposition: attachment; filename="instasave_earthpix_C8xYzDemo1_1080p.mp4"
Content-Type: video/mp4
```

### `GET /api/download-zip?token=<token>`
Streams a zipped archive containing all carousel slides with:
```http
Content-Disposition: attachment; filename="instasave_sample_carousel_carousel.zip"
Content-Type: application/zip
```

---

## ⚖️ Legal & Compliance Notice

> **Disclaimer:** InstaSave is strictly for personal, non-commercial use. Users must only download content they own or have explicit permission to use. InstaSave is an independent open-source tool and is not affiliated with, endorsed, or sponsored by Instagram™ or Meta Platforms, Inc.
