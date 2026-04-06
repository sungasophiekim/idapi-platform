// src/components/layout/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLang } from '@/lib/i18n';
import { Icon } from '@/components/ui';

export default function Header() {
  const { lang, setLang, t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const navItems = [
    { href: '/about', label: t('About', 'About') },
    { href: '/dashboard', label: t('대시보드', 'Dashboard') },
    { href: '/analyze', label: t('AI 분석', 'AI Analyzer') },
    { href: '/research', label: t('연구자료', 'Research') },
    { href: '/team', label: t('팀 소개', 'Team') },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-white/[0.94] backdrop-blur-xl border-b border-border transition-shadow duration-300 ${scrolled ? 'shadow-sm' : ''}`}>
      <div className="max-w-[1140px] mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-[30px] h-[30px] bg-green-deep rounded-md flex items-center justify-center text-white font-bold text-[11px] tracking-wider">ID</div>
          <div className="leading-tight">
            <div className="font-bold text-[17px] tracking-tight">IDAPI</div>
            <div className="text-[10px] text-gray-400 tracking-wide">
              {t('국제디지털자산정책연구소', "Int'l Digital Asset Policy Institute")}
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-gray-500 hover:text-green-deep transition-colors">
              {item.label}
            </Link>
          ))}

          {/* Language Toggle */}
          <div className="flex border border-gray-200 rounded-md overflow-hidden">
            {(['ko', 'en'] as const).map(l => (
              <button key={l} onClick={() => setLang(l)}
                className={`px-2.5 py-1 text-[11px] font-bold transition-all ${lang === l ? 'bg-green-deep text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                {l === 'ko' ? 'KOR' : 'ENG'}
              </button>
            ))}
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen}>
          <Icon name={mobileOpen ? 'x' : 'menu'} size={22} />
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-border bg-white px-6 py-4 space-y-3" aria-label="Mobile navigation">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
              className="block text-sm font-medium text-gray-600 py-2">
              {item.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2">
            {(['ko', 'en'] as const).map(l => (
              <button key={l} onClick={() => { setLang(l); setMobileOpen(false); }}
                className={`px-3 py-1.5 text-xs font-bold rounded ${lang === l ? 'bg-green-deep text-white' : 'bg-gray-100 text-gray-500'}`}>
                {l === 'ko' ? '한국어' : 'English'}
              </button>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
