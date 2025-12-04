# ExTracker - Expense Tracker App

A modern expense tracking application built with Next.js 15, featuring OCR receipt scanning, real-time data sync, and beautiful mobile-first UI.

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) with App Router & Turbopack
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication:** [Supabase Auth](https://supabase.com/auth) (Google OAuth)
- **Storage:** [Supabase Storage](https://supabase.com/storage) (Receipt images)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **AI/OCR:** [Google Gemini AI](https://ai.google.dev/) (Receipt scanning)
- **Internationalization:** [next-intl](https://next-intl-docs.vercel.app/) (EN/TH)
- **Icons:** [Lucide React](https://lucide.dev/)

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
- ✅ **Transaction Management** - Add, view, edit, and delete income/expense transactions
- ✅ **OCR Receipt Scanning** - AI-powered receipt data extraction using Gemini AI
- ✅ **Account Management** - Multiple accounts with custom colors
- ✅ **Category Management** - Customizable income/expense categories
- ✅ **Real-time Sync** - Instant data synchronization with Supabase
- ✅ **Image Upload** - Receipt photo capture and storage
- ✅ **Search & Filter** - Search transactions by text and date range
- ✅ **Summary Dashboard** - Income, expense, and balance overview
- ✅ **Authentication** - Secure Google OAuth login
- ✅ **Internationalization** - English and Thai language support

### UI/UX Features
- ✅ **Mobile-First Design** - Optimized for mobile devices
- ✅ **Modern Color Scheme** - Blue gradient header, orange accents
- ✅ **Bottom Navigation** - Easy thumb-reach navigation
- ✅ **Loading States** - Skeleton screens for smooth UX
- ✅ **Tab-Based Profile** - Profile, Accounts, Categories tabs
- ✅ **Image Zoom Modal** - Full-screen receipt preview
- ✅ **No Decimals** - Clean number formatting with commas
- ✅ **Responsive Layout** - Works on all screen sizes

## Quick Start

### Prerequisites
- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- [Supabase](https://supabase.com/) account
- [Google Gemini API](https://ai.google.dev/) key

### Installation

1. Clone and install dependencies:
```bash
bun install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Add your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
```

3. Run the development server:
```bash
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Database Setup

### Supabase Tables

Create the following tables in your Supabase project:

**accounts**
```sql
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366F1',
  created_at TIMESTAMP DEFAULT NOW()
);
```

**categories**
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**transactions**
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL NOT NULL,
  account_id UUID REFERENCES accounts,
  category_id UUID REFERENCES categories,
  date DATE NOT NULL,
  note TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Storage Bucket

Create a storage bucket named `receipts` for receipt images.

## App Configuration

Edit `src/lib/config.ts`:
```typescript
export const APP_NAME = 'ExTracker'
export const APP_DESCRIPTION = 'Track your expenses'
```

## Key Features

### OCR Receipt Scanning

The app uses Google Gemini AI to extract transaction data from receipt images:
- Automatically detects amount, date, merchant name
- Suggests appropriate category based on merchant
- Supports Thai language categories
- Processes images in real-time

### Transaction Management

- **Add Transactions**: Manual entry or OCR scanning
- **View Transactions**: List with search and date filters
- **Delete Transactions**: One-tap deletion
- **Summary Cards**: Real-time income/expense/balance

### Account & Category Management

- **Custom Accounts**: Create accounts with custom colors
- **Custom Categories**: Add income/expense categories
- **User-Specific**: Only edit/delete your own categories
- **Tab Interface**: Easy navigation between profile sections

## Project Structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── (auth)/login/      # Login page
│   │   ├── add/               # Add transaction page
│   │   ├── profile/           # Profile & settings
│   │   ├── summary/           # Summary dashboard
│   │   ├── transactions/      # Transaction list
│   │   ├── home-content.tsx   # Home page content
│   │   └── page.tsx           # Home page
│   └── api/ocr/               # OCR API endpoint
├── components/
│   ├── bottom-nav/            # Bottom navigation
│   ├── conditional-layout.tsx # Layout with header
│   └── language-switcher.tsx  # Language toggle
├── lib/
│   ├── supabase/              # Supabase client & types
│   └── config.ts              # App configuration
└── messages/                  # Translations (EN/TH)
```

## Pages

- **Dashboard** (`/`) - Recent transactions and summary
- **Add Transaction** (`/add`) - Add new transaction with OCR
- **Transactions** (`/transactions`) - List all transactions with filters
- **Summary** (`/summary`) - Detailed financial overview
- **Profile** (`/profile`) - User profile, accounts, and categories

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

## Color Scheme

- **Header**: Blue to Indigo gradient (`from-blue-600 to-indigo-600`)
- **Background**: Light gray (`bg-gray-50`)
- **Income**: Green (`green-600`, `green-100`)
- **Expense**: Orange (`orange-600`, `orange-100`)
- **Primary**: Blue (`blue-600`, `blue-200`)
- **Bottom Nav**: White with shadow

## License

MIT
