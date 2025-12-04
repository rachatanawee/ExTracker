# Mobile-First Features

## 🎯 Features เพิ่มเติมสำหรับ Mobile Template

### 1. PWA Support
- ✅ `manifest.json` - PWA configuration
- ✅ `sw.js` - Service Worker สำหรับ offline support
- ✅ Viewport meta tags & safe area handling

### 2. Mobile Hooks
```tsx
// Orientation detection
import { useOrientation } from "@/hooks";
const orientation = useOrientation(); // "portrait" | "landscape"

// Touch gestures
import { useSwipe, useHaptic } from "@/hooks";
useSwipe({
  onSwipeLeft: () => console.log("Swipe left"),
  onSwipeRight: () => console.log("Swipe right"),
});
const { vibrate } = useHaptic();
vibrate(10); // Haptic feedback

// Pull to refresh
import { usePullToRefresh } from "@/hooks";
const { isRefreshing } = usePullToRefresh(async () => {
  await fetchData();
});

// Network status
import { useNetwork } from "@/hooks";
const { isOnline } = useNetwork();

// Responsive detection
import { useIsMobile, useIsTablet, useIsDesktop } from "@/hooks";
const isMobile = useIsMobile();
```

### 3. UI Components
```tsx
// Loading skeleton
import { Skeleton } from "@/components/ui";
<Skeleton className="h-20 w-full" />

// Spinner
import { Spinner } from "@/components/ui";
<Spinner size="md" />

// Bottom sheet
import { Sheet, SheetContent } from "@/components/ui";
<Sheet open={open} onOpenChange={setOpen}>
  <SheetContent>Content here</SheetContent>
</Sheet>

// Toast notification
import { Toast } from "@/components/ui";
<Toast message="Success!" type="success" />
```

### 4. Mobile Utilities (CSS)
```css
.touch-manipulation      /* ป้องกัน double-tap zoom */
.tap-highlight-transparent  /* ลบ highlight เมื่อ tap */
.safe-top / .safe-bottom / .safe-left / .safe-right  /* iOS safe area */
.overscroll-none        /* ป้องกัน bounce effect */
.scrollbar-hide         /* ซ่อน scrollbar */
```

### 5. Responsive Breakpoints
- Mobile: `max-width: 768px`
- Tablet: `769px - 1024px`
- Desktop: `min-width: 1025px`

## 📱 การใช้งาน

### ติดตั้ง Service Worker
เพิ่มใน `layout.tsx`:
```tsx
import { RegisterSW } from "@/app/register-sw";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}
```

### ตัวอย่างการใช้ Pull-to-Refresh
```tsx
"use client";

import { usePullToRefresh } from "@/hooks";

export default function Page() {
  const { isRefreshing } = usePullToRefresh(async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  return (
    <div>
      {isRefreshing && <Spinner />}
      <h1>Pull down to refresh</h1>
    </div>
  );
}
```

### ตัวอย่างการใช้ Swipe Gestures
```tsx
"use client";

import { useSwipe } from "@/hooks";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  
  useSwipe({
    onSwipeRight: () => router.back(),
    onSwipeLeft: () => router.push("/next-page"),
  });

  return <div>Swipe to navigate</div>;
}
```

## 🎨 Best Practices

1. **Touch Targets**: ขนาดปุ่มอย่างน้อย 44x44px
2. **Safe Areas**: ใช้ safe area utilities สำหรับ iOS
3. **Loading States**: แสดง skeleton/spinner เสมอ
4. **Haptic Feedback**: ใช้ vibration สำหรับ important actions
5. **Offline Support**: ตรวจสอบ network status ก่อน fetch
6. **Performance**: ใช้ lazy loading สำหรับ images/components

## 🔧 Configuration

### PWA Manifest (`public/manifest.json`)
แก้ไข name, colors, icons ตามต้องการ

### Service Worker (`public/sw.js`)
เพิ่ม URLs ที่ต้องการ cache

### Viewport Settings (`layout.tsx`)
ปรับ viewport config ตามต้องการ
