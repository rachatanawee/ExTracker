import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav/bottom-nav";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { PageTransitionWrapper } from "@/components/page-transition-wrapper";
import { RegisterSW } from "@/app/register-sw";
import { ConditionalLayout } from "@/components/conditional-layout";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/config";
import { InstallPrompt } from "@/components/install-prompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  icons: {
    icon: '/favicon.ico',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Next.js',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#000000',
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <RegisterSW />
          <InstallPrompt />
          <ConditionalLayout>{children}</ConditionalLayout>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
