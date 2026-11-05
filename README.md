# Enkaprime Consulting Ltd

Official corporate website for **Enka Prime Consulting Ltd**, built with React, TypeScript, Vite, Tailwind CSS, and integrated with Supabase CMS.

## Features

- **Modern Architecture**: Built with React 18, TypeScript, Vite, and Tailwind CSS.
- **Service Showcases**: Records Digitalisation, Asset Tagging, ISO Implementation, and Corporate Training.
- **Dynamic Training Catalogue**: Comprehensive directory of corporate training programmes by category.
- **Admin CMS**: Dedicated administrative panel for managing banners, hero sliders, team members, blog posts, programmes, and site settings.
- **Supabase Integration**: Live database connection with automatic fallback for local/offline operation.
- **Responsive & Accessible**: Mobile-friendly navigation, social rail, and SEO meta tags.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

*(If environment variables are omitted, the application automatically runs with safe fallback mode).*

### 3. Start Development Server

```bash
npm run dev
```

### 4. Type Checking & Linting

```bash
npm run typecheck
npm run lint
```

### 5. Production Build

```bash
npm run build
npm run preview
```

## Deployment

The project is configured for automated deployment to GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`).
