import type { Metadata } from 'next';
import { Heebo, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { NavigationBar } from '@/components/NavigationBar';
import { t } from '@/lib/translations';

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-heebo',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: t.nav.maiCosmetics,
  description: 'מערכת ניהול עסקי - מאי קוסמטיקס',
  manifest: '/site.webmanifest',
  viewport: { width: 'device-width', initialScale: 1, maximumScale: 5 },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-background text-text-primary">
        <div className="flex min-h-screen">
          <NavigationBar />
          <main className="flex-1 overflow-auto pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
