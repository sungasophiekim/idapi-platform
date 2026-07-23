// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IDAPI | 디지털·AI 정책인프라 연구소',
  description: '디지털·AI 시대의 정책 인프라를 설계하는 정책 싱크탱크 — Institute for Digital and AI Policy Infrastructure',
  openGraph: {
    title: 'IDAPI | Institute for Digital and AI Policy Infrastructure',
    description: 'Institute for Digital and AI Policy Infrastructure',
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
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
