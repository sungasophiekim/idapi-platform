// src/app/(public)/layout.tsx
import { I18nProvider } from '@/lib/i18n';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </I18nProvider>
  );
}
