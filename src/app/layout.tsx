// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IDAPI | 국제디지털자산정책연구소',
  description: '전문가 집단지성으로 설계하는 디지털 자산 정책의 내일 — International Digital Asset Policy Institute',
  openGraph: {
    title: 'IDAPI | International Digital Asset Policy Institute',
    description: 'Shaping the Future of Digital Asset Policy through Collective Intelligence',
    locale: 'ko_KR',
    alternateLocale: 'en_US',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
