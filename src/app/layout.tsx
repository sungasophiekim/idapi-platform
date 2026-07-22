// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'iDAPI | 디지털·AI 공공인프라 연구소',
  description: '디지털·AI 시대의 공공 인프라를 설계하는 정책 싱크탱크 — Institute for Digital & AI Public Infrastructure',
  openGraph: {
    title: 'iDAPI | Institute for Digital & AI Public Infrastructure',
    description: 'Shaping public infrastructure for the digital & AI era',
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
