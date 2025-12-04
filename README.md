# Next.js Mobile-First Template

A production-ready [Next.js](https://nextjs.org) template optimized for mobile-first development with PWA support, internationalization, and comprehensive mobile UX features.

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) with App Router
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Internationalization:** [next-intl](https://next-intl-docs.vercel.app/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Authentication:** [Supabase](https://supabase.com/)

## Getting Started

First, install dependencies:

```bash
bun install
```

Then, run the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

### Core Features
- ✅ Next.js 15 with App Router & Turbopack
- ✅ TypeScript for type safety
- ✅ Tailwind CSS v4 with custom design system
- ✅ Internationalization (English & Thai) with language switcher
- ✅ Supabase authentication (Google OAuth)
- ✅ Page transitions with Framer Motion
- ✅ Smooth loading states with skeleton screens
- ✅ Responsive design (mobile-first)
- ✅ Centralized app configuration

### Mobile-First Features
- ✅ **PWA Support** - Installable app with offline capability
- ✅ **Touch Gestures** - Swipe navigation & interactions
- ✅ **Haptic Feedback** - Native-like vibration feedback
- ✅ **Pull-to-Refresh** - Mobile refresh pattern
- ✅ **Safe Area Handling** - iOS notch & home indicator support
- ✅ **Network Detection** - Online/offline status monitoring
- ✅ **Bottom Navigation** - Mobile-optimized navigation
- ✅ **Bottom Sheets** - Native-like modal drawers
- ✅ **Toast Notifications** - Mobile-friendly alerts
- ✅ **Responsive Hooks** - Device detection utilities
- ✅ **Orientation Detection** - Portrait/landscape handling

## Quick Start

### Prerequisites
- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- Supabase account (for authentication)

### Installation

1. Clone and install dependencies:
```bash
bun install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Add your Supabase credentials and site URL:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**For production deployment**, update `NEXT_PUBLIC_SITE_URL` to your production domain:
```env
NEXT_PUBLIC_SITE_URL=https://yourproductiondomain.com
```

3. Run the development server:
```bash
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Configuration

### App Settings

Edit `src/lib/config.ts` to customize your app:

```typescript
export const APP_NAME = 'My App'
export const APP_DESCRIPTION = 'My App with i18n'
```

### Internationalization

Add or edit translations in:
- `messages/en.json` - English translations
- `messages/th.json` - Thai translations

Language switcher is available in the header on all pages.

## Mobile Features Usage

### Hooks

```tsx
import { 
  useSwipe, 
  useHaptic, 
  usePullToRefresh,
  useNetwork,
  useIsMobile,
  useOrientation 
} from "@/hooks";

// Swipe gestures
useSwipe({
  onSwipeLeft: () => console.log("Swipe left"),
  onSwipeRight: () => console.log("Swipe right"),
});

// Haptic feedback
const { vibrate } = useHaptic();
vibrate(10);

// Pull to refresh
const { isRefreshing } = usePullToRefresh(async () => {
  await fetchData();
});

// Network status
const { isOnline } = useNetwork();

// Device detection
const isMobile = useIsMobile();
const orientation = useOrientation();
```

### Components

```tsx
import { Skeleton, Sheet, Spinner, Toast } from "@/components/ui";

// Loading skeleton
<Skeleton className="h-20 w-full" />

// Bottom sheet
<Sheet open={open} onOpenChange={setOpen}>
  <SheetContent>Content</SheetContent>
</Sheet>

// Spinner
<Spinner size="md" />

// Toast
<Toast message="Success!" type="success" />
```

### CSS Utilities

```css
.touch-manipulation      /* Prevent double-tap zoom */
.tap-highlight-transparent  /* Remove tap highlight */
.safe-top / .safe-bottom    /* iOS safe areas */
.overscroll-none         /* Prevent bounce effect */
.scrollbar-hide          /* Hide scrollbar */
```

## Project Structure

```
src/
├── app/
│   ├── [locale]/          # Internationalized routes
│   │   ├── (auth)/        # Auth pages (login)
│   │   ├── auth/          # Auth callback
│   │   ├── profile/       # Profile page
│   │   ├── layout.tsx     # Root layout
│   │   ├── loading.tsx    # Loading state
│   │   └── page.tsx       # Home page
│   └── register-sw.tsx    # Service worker registration
├── components/
│   ├── ui/                # Reusable UI components
│   ├── bottom-nav/        # Bottom navigation
│   ├── conditional-layout.tsx  # Layout wrapper
│   ├── language-switcher.tsx   # Language toggle
│   └── page-transition-wrapper.tsx  # Page animations
├── hooks/                 # Custom React hooks
├── lib/
│   ├── supabase/          # Supabase client
│   ├── config.ts          # App configuration
│   └── utils.ts           # Utility functions
└── messages/              # i18n translations
    ├── en.json            # English
    └── th.json            # Thai

public/
├── manifest.json          # PWA manifest
└── sw.js                  # Service worker
```

## Documentation

- **[MOBILE-FEATURES.md](./MOBILE-FEATURES.md)** - Comprehensive mobile features guide
- **[.env.example](./.env.example)** - Environment variables template

## Development

### Build for Production
```bash
bun run build
```

### Start Production Server
```bash
bun start
```

### Lint Code
```bash
bun run lint
```

## Browser Support

- Chrome/Edge (latest)
- Safari (iOS 12+)
- Firefox (latest)
- Samsung Internet (latest)

## License

MIT
