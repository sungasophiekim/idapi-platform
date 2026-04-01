import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "IDAPI — International Digital Asset Policy Institute",
  description: "전문가 집단지성으로 설계하는 디지털 자산 정책의 내일",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${dmSans.variable} antialiased`}>
      <body style={{ fontFamily: "'DM Sans', 'Noto Sans KR', sans-serif", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
