# ExTracker - Development Documentation

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Tech Stack Details](#tech-stack-details)
3. [Features Implementation](#features-implementation)
4. [Database Schema](#database-schema)
5. [Authentication Flow](#authentication-flow)
6. [File Upload & Storage](#file-upload--storage)
7. [OCR Integration](#ocr-integration)
8. [Internationalization](#internationalization)
9. [State Management](#state-management)
10. [Performance Optimization](#performance-optimization)
11. [Deployment](#deployment)

---

## Architecture Overview

### Project Structure
```
ExTracker/
├── src/
│   ├── app/
│   │   ├── [locale]/              # Internationalized routes
│   │   │   ├── (auth)/login/      # Login page (excluded from layout)
│   │   │   ├── add/               # Add transaction
│   │   │   ├── profile/           # User profile & settings
│   │   │   ├── summary/           # Financial summary
│   │   │   ├── transactions/      # Transaction list
│   │   │   ├── auth/callback/     # OAuth callback handler
│   │   │   ├── home-content.tsx   # Dashboard with donut chart
│   │   │   ├── loading.tsx        # Loading skeleton
│   │   │   └── page.tsx           # Home page wrapper
│   │   └── api/
│   │       ├── ocr/               # OCR processing endpoint
│   │       └── image/             # Authenticated image proxy
│   ├── components/
│   │   ├── bottom-nav/            # Bottom navigation bar
│   │   ├── conditional-layout.tsx # Layout wrapper with auth check
│   │   ├── language-switcher.tsx  # EN/TH language toggle
│   │   └── page-transition-wrapper.tsx # Page animations
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts          # Client-side Supabase
│   │   │   ├── server.ts          # Server-side Supabase
│   │   │   └── types.ts           # Generated TypeScript types
│   │   ├── config.ts              # App configuration
│   │   ├── get-url.ts             # URL utility for OAuth
│   │   └── version.ts             # Auto version from package.json
│   ├── messages/
│   │   ├── en.json                # English translations
│   │   └── th.json                # Thai translations
│   └── proxy.ts                   # Middleware for auth & i18n
├── public/
│   ├── manifest.json              # PWA manifest
│   └── sw.js                      # Service worker
└── package.json
```

---

## Tech Stack Details

### Next.js 16 with App Router
- **Turbopack**: Fast bundler for development
- **Server Components**: Default rendering strategy
- **Route Handlers**: API endpoints
- **Middleware**: Authentication & i18n routing
- **Suspense**: Loading states with loading.tsx

### TypeScript
- Strict mode enabled
- Generated types from Supabase schema
- Type-safe API calls

### Supabase
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Authentication**: Google OAuth
- **Storage**: Private bucket for receipt images
- **Real-time**: Instant data synchronization

### Tailwind CSS v4
- Custom color scheme (purple/orange/green)
- Mobile-first responsive design
- 16px base font size
- Custom utilities for safe areas

### Google Gemini AI
- Model: gemini-2.5-flash-lite
- Receipt OCR processing
- Thai language support

### next-intl
- Locale routing with middleware
- Server-side translations
- Client-side translations via props

---

## Features Implementation

### 1. Transaction Management

#### Add Transaction
**File**: `src/app/[locale]/add/add-transaction-form.tsx`

**Features**:
- Manual entry with form validation
- OCR scanning from camera/gallery
- Auto-focus on amount input
- Form reset after successful save
- Toast notifications for success/error

**Key Functions**:
```typescript
// Get local time without timezone offset
const getLocalTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// Save transaction
const handleSave = async () => {
  const { error } = await supabase.from('transactions').insert({
    user_id: user.id,
    type,
    amount: parseFloat(amount),
    account_id: accountId,
    category_id: categoryId,
    date: `${date} ${time}`,
    note,
    image_url: uploadedImageUrl
  })
}
```

#### Transaction List
**File**: `src/app/[locale]/transactions/transaction-list.tsx`

**Features**:
- Search by text (note, account, category)
- Date range filter (defaults to current week)
- Summary cards (income, expense, balance)
- Delete with confirmation modal
- Image preview on click
- Authenticated image URLs via proxy

**Key Functions**:
```typescript
// Get current week range (Sunday-Saturday)
const getWeekRange = () => {
  const today = new Date()
  const day = today.getDay()
  const sunday = new Date(today)
  sunday.setDate(today.getDate() - day)
  const saturday = new Date(sunday)
  saturday.setDate(sunday.getDate() + 6)
  return {
    from: sunday.toISOString().split('T')[0],
    to: saturday.toISOString().split('T')[0]
  }
}

// Convert storage path to authenticated proxy URL
const transactionsWithProxyUrls = data.map(t => {
  if (t.image_url && t.image_url.includes('/receipts/')) {
    const path = t.image_url.split('/receipts/')[1]
    return { ...t, image_url: `/api/image?path=${encodeURIComponent(path)}` }
  }
  return t
})
```

### 2. Dashboard with Donut Chart

**File**: `src/app/[locale]/home-content.tsx`

**Features**:
- Month/year selector
- Donut chart showing top 5 expense categories
- Color-coded legend with amounts
- Recent 10 transactions
- Summary cards

**Chart Implementation**:
```typescript
// SVG donut chart with percentage calculation
<svg viewBox="0 0 100 100" className="transform -rotate-90">
  {categoryExpenses.reduce((acc, cat, i) => {
    const prevPercentage = categoryExpenses.slice(0, i)
      .reduce((sum, c) => sum + c.percentage, 0)
    const strokeDasharray = `${cat.percentage} ${100 - cat.percentage}`
    const strokeDashoffset = -prevPercentage
    acc.push(
      <circle
        key={cat.name}
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke={cat.color}
        strokeWidth="20"
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
      />
    )
    return acc
  }, [] as React.ReactElement[])}
</svg>
```

### 3. Profile & Data Management

**File**: `src/app/[locale]/profile/profile-content.tsx`

**Features**:
- Two tabs: Profile and Data
- Profile tab: User info, logout button
- Data tab: Accounts and Categories management
- Add/Edit/Delete accounts with custom colors
- Add/Delete categories (income/expense)
- User-specific data only

**Tab Implementation**:
```typescript
const [activeTab, setActiveTab] = useState<'profile' | 'data'>('profile')

// Tab buttons
<button
  onClick={() => setActiveTab('profile')}
  className={activeTab === 'profile' ? 'border-b-2 border-purple-600' : ''}
>
  Profile
</button>
```

---

## Database Schema

### Tables

#### accounts
```sql
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366F1',
  created_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own accounts"
  ON accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts"
  ON accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts"
  ON accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts"
  ON accounts FOR DELETE
  USING (auth.uid() = user_id);
```

#### categories
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policies (same as accounts)
```

#### transactions
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL NOT NULL,
  account_id UUID REFERENCES accounts,
  category_id UUID REFERENCES categories,
  date TEXT NOT NULL,  -- Format: "YYYY-MM-DD HH:mm"
  note TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policies (same as accounts)
```

**Important**: `date` field is TEXT to avoid timezone issues. Store as "YYYY-MM-DD HH:mm" format.

### Storage

#### receipts bucket
- **Type**: Private
- **Access**: Authenticated users only
- **RLS Policy**:
```sql
CREATE POLICY "Users can upload own receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'receipts' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own receipts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'receipts' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## Authentication Flow

### Google OAuth Setup

1. **Supabase Configuration**:
   - Enable Google provider
   - Add redirect URLs:
     - `http://localhost:3000/*/auth/callback`
     - `https://your-domain.com/*/auth/callback`

2. **Login Flow**:
```typescript
// src/app/[locale]/(auth)/login/login-form.tsx
const handleGoogleLogin = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/${locale}/auth/callback`
    }
  })
}
```

3. **Callback Handler**:
```typescript
// src/app/[locale]/auth/callback/route.ts
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const pathname = request.nextUrl.pathname
  const locale = pathname.split('/')[1] || 'en'
  
  if (code) {
    const supabase = createServerClient(...)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(new URL(`/${locale}`, origin))
    }
  }
  
  return NextResponse.redirect(`${origin}/${locale}/login?error=auth_failed`)
}
```

4. **Middleware Protection**:
```typescript
// src/proxy.ts
const protectedRoutes = ['', '/profile', '/add', '/transactions', '/summary']

if (!session && protectedRoutes.includes(requestedPath)) {
  return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
}

if (session && requestedPath === '/login') {
  return NextResponse.redirect(new URL(`/${locale}`, request.url))
}
```

---

## File Upload & Storage

### Upload Flow

1. **Client-side Upload**:
```typescript
// src/app/[locale]/add/add-transaction-form.tsx
const handleImageUpload = async (file: File) => {
  const fileName = `${Date.now()}.${file.name.split('.').pop()}`
  const filePath = `${user.id}/${fileName}`
  
  const { error } = await supabase.storage
    .from('receipts')
    .upload(filePath, file)
  
  if (!error) {
    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(filePath)
    
    setUploadedImageUrl(publicUrl)
  }
}
```

2. **Authenticated Image Proxy**:
```typescript
// src/app/api/image/route.ts
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const path = request.nextUrl.searchParams.get('path')
  const { data, error } = await supabase.storage
    .from('receipts')
    .download(path)
  
  if (error || !data) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  return new NextResponse(data, {
    headers: {
      'Content-Type': data.type,
      'Cache-Control': 'private, max-age=3600'
    }
  })
}
```

3. **Display Images**:
```typescript
// Convert storage URL to proxy URL
const path = imageUrl.split('/receipts/')[1]
const proxyUrl = `/api/image?path=${encodeURIComponent(path)}`

<img src={proxyUrl} alt="Receipt" />
```

---

## OCR Integration

### Gemini AI Setup

**File**: `src/app/api/ocr/route.ts`

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ 
  model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' 
})

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('image') as File
  
  // Convert to base64
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const base64 = buffer.toString('base64')
  
  // Prepare prompt
  const prompt = `
    Analyze this receipt image and extract:
    1. Total amount (number only)
    2. Date (YYYY-MM-DD format)
    3. Time (HH:mm format)
    4. Merchant/store name
    5. Category (in Thai: อาหาร, เครื่องดื่ม, ช้อปปิ้ง, ขนส่ง, etc.)
    
    Return JSON format:
    {
      "amount": number,
      "date": "YYYY-MM-DD",
      "time": "HH:mm",
      "note": "merchant name",
      "category": "category in Thai"
    }
  `
  
  // Generate content
  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType: file.type,
        data: base64
      }
    }
  ])
  
  const text = result.response.text()
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  const data = JSON.parse(jsonMatch[0])
  
  return Response.json(data)
}
```

### Usage in Form

```typescript
const handleOCR = async () => {
  const formData = new FormData()
  formData.append('image', file)
  
  const response = await fetch('/api/ocr', {
    method: 'POST',
    body: formData
  })
  
  const data = await response.json()
  
  // Auto-fill form
  setAmount(data.amount.toString())
  setDate(data.date)
  setTime(data.time)
  setNote(data.note)
  // Find category by name
  const category = categories.find(c => c.name === data.category)
  if (category) setCategoryId(category.id)
}
```

---

## Internationalization

### Setup

**File**: `src/i18n.ts`
```typescript
import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default
}))
```

**File**: `src/proxy.ts`
```typescript
import createIntlMiddleware from 'next-intl/middleware'

const intlMiddleware = createIntlMiddleware({
  locales: ['en', 'th'],
  defaultLocale: 'en',
  localePrefix: 'always'
})
```

### Translation Files

**File**: `src/messages/en.json`
```json
{
  "HomePage": {
    "title": "Dashboard",
    "recentTransactions": "Recent Transactions",
    "income": "Income",
    "expense": "Expense"
  },
  "AddPage": {
    "title": "Add Transaction",
    "amount": "Amount",
    "save": "Save"
  }
}
```

### Usage

**Server Component**:
```typescript
import { getTranslations } from 'next-intl/server'

export default async function Page({ params }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'HomePage' })
  
  return <h1>{t('title')}</h1>
}
```

**Client Component**:
```typescript
'use client'
import { useTranslations } from 'next-intl'

export function Component() {
  const t = useTranslations('HomePage')
  return <h1>{t('title')}</h1>
}
```

---

## State Management

### Client-side State
- **useState**: Local component state
- **useEffect**: Data fetching and side effects
- **No global state library**: Keep it simple

### Server-side State
- **Supabase**: Single source of truth
- **Real-time subscriptions**: Optional for live updates

### Example Pattern
```typescript
'use client'

export function TransactionList() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchTransactions()
  }, [])
  
  const fetchTransactions = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
    
    setTransactions(data)
    setLoading(false)
  }
  
  return loading ? <Skeleton /> : <List data={transactions} />
}
```

---

## Performance Optimization

### 1. Loading States with Suspense

**File**: `src/app/[locale]/loading.tsx`
```typescript
export default function Loading() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-24" />
        </div>
      ))}
    </div>
  )
}
```

### 2. Image Optimization
- Use Next.js Image component (optional)
- Lazy load images
- Compress before upload

### 3. Database Queries
- Select only needed columns
- Use indexes on frequently queried fields
- Limit results with pagination

### 4. Caching
- API routes: Cache-Control headers
- Static assets: Long cache duration
- Service Worker: Cache API responses

---

## Deployment

### Vercel Deployment

1. **Connect Repository**:
   - Import project from GitHub
   - Select ExTracker directory

2. **Environment Variables**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
GEMINI_API_KEY=xxx
GEMINI_MODEL=gemini-2.5-flash-lite
```

3. **Build Settings**:
   - Framework: Next.js
   - Build Command: `bun run build`
   - Output Directory: `.next`

4. **Domain Configuration**:
   - Add custom domain (optional)
   - Update Supabase redirect URLs

### Supabase Configuration

1. **Redirect URLs**:
   - Add production URL: `https://your-domain.com/*/auth/callback`
   - Keep localhost for development

2. **Storage Bucket**:
   - Ensure `receipts` bucket is private
   - RLS policies are enabled

3. **Database**:
   - Run migrations if any
   - Enable RLS on all tables

### Post-Deployment

1. **Test OAuth Flow**:
   - Login with Google
   - Verify redirect works

2. **Test Image Upload**:
   - Upload receipt
   - Verify image displays

3. **Test OCR**:
   - Scan receipt
   - Verify data extraction

4. **Monitor**:
   - Check Vercel logs
   - Check Supabase logs
   - Monitor API usage

---

## Version Management

### Auto Version from package.json

**File**: `src/lib/version.ts`
```typescript
import packageJson from '../../package.json'
export const APP_VERSION = packageJson.version
```

### Bump Version
```bash
bun run version:patch  # 0.0.x
bun run version:minor  # 0.x.0
bun run version:major  # x.0.0
```

### Display Version
```typescript
import { APP_VERSION } from '@/lib/version'

<span>v{APP_VERSION}</span>
```

---

## Troubleshooting

### Common Issues

1. **OAuth Redirect Loop**:
   - Check redirect URLs in Supabase
   - Verify callback route is working
   - Check middleware auth logic

2. **Images Not Loading**:
   - Verify bucket is private
   - Check RLS policies
   - Test proxy API route

3. **OCR Not Working**:
   - Check Gemini API key
   - Verify image format (JPEG/PNG)
   - Check API quota

4. **Timezone Issues**:
   - Use TEXT field for date
   - Store as "YYYY-MM-DD HH:mm"
   - Use getLocalTime() helper

5. **Build Errors**:
   - Check TypeScript errors
   - Verify all imports
   - Clear .next directory

---

## Best Practices

1. **Security**:
   - Never expose service role key
   - Use RLS on all tables
   - Validate user input
   - Use authenticated image proxy

2. **Performance**:
   - Use loading states
   - Optimize images
   - Minimize API calls
   - Cache when possible

3. **UX**:
   - Show loading indicators
   - Use toast notifications
   - Confirm destructive actions
   - Auto-focus inputs

4. **Code Quality**:
   - Use TypeScript strictly
   - Follow naming conventions
   - Comment complex logic
   - Keep components small

5. **Testing**:
   - Test on real devices
   - Test different screen sizes
   - Test offline scenarios
   - Test edge cases

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Google Gemini AI Documentation](https://ai.google.dev/docs)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)

---

**Last Updated**: December 2025
**Version**: 0.5.16
