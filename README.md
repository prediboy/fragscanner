# FragScanner 🌟

**FragScanner** is an intelligent Middle Eastern & Niche fragrance matching engine with real-time community seller price comparisons.

---

## Features
- **Personalized Wardrobe Matcher**: Mark fragrances you **love** (and check scents you **dislike**). FragScanner computes your multi-accord olfactory profile and suggests closest scent twins out of 5.0 while actively filtering conflicting notes.
- **Real-Time Community Seller Price Comparison**:
  - Live synced quotes from **Second Theory** and **FragFever**.
  - Highlights lowest quoted price in ₹ and direct 1-click **WhatsApp Buy** buttons.
  - Multi-seller comparison table in detail modal.
- **Clash Warnings**: Polarizing notes detector highlighting scents likely to cause olfactory fatigue or clashing profiles.
- **Zero-Maintenance Sync Pipeline**: Automated ingestion script (`scripts/sync_all_community_sellers.py`) and scheduled GitHub Action (`.github/workflows/sync_sellers.yml`) that pulls live prices directly from public Google Sheets every 6 hours.

---

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons.
- **Data Engine**: Python sync & normalization pipelines, Google Sheets live CSV API.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Sync Community Seller Prices
To pull the latest Google Sheets prices and stock:
```bash
python3 scripts/sync_all_community_sellers.py
```

### 4. Build for Production
```bash
npm run build
```
