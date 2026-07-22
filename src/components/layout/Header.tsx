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

  type NavItem =
    | { href: string; label: string }
    | { label: string; children: { href: string; label: string }[] };

  const navItems: NavItem[] = [
    { href: '/research', label: t('연구자료', 'Research') },
    { href: '/insights', label: t('뉴스클리핑', 'News') },
    { href: '/dashboard', label: t('정책 레이더', 'Policy Radar') },
    {
      label: t('소개', 'About'),
      children: [
        { href: '/about', label: t('재단소개', 'The Institute') },
        { href: '/team', label: t('팀 소개', 'Team') },
      ],
    },
  ];

  const Chevron = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" className="mt-px opacity-70">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );

  return (
    <header className={`fixed top-9 left-0 right-0 z-50 bg-white/[0.94] backdrop-blur-xl border-b border-border transition-shadow duration-300 ${scrolled ? 'shadow-sm' : ''}`}>
      <div className="max-w-[1140px] mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-[30px] h-[30px] bg-green-deep rounded-md flex items-center justify-center text-white font-bold text-[11px] tracking-wider">ID</div>
          <div className="leading-tight">
            <div className="font-bold text-[17px] tracking-tight">iDAPI</div>
            <div className="text-[10px] text-gray-400 tracking-wide">
              {t('디지털·AI 공공인프라 연구소', 'Digital & AI Public Infrastructure')}
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
          {navItems.map(item => (
            'children' in item ? (
              <div key={item.label} className="relative group">
                <button className="text-sm font-medium text-gray-500 group-hover:text-green-deep transition-colors inline-flex items-center gap-1">
                  {item.label}<Chevron />
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 hidden group-hover:block">
                  <div className="bg-white border border-border rounded-lg shadow-lg py-1.5 min-w-[150px]">
                    {item.children.map(c => (
                      <Link key={c.href} href={c.href} className="block px-4 py-2 text-sm font-medium text-gray-600 hover:text-green-deep hover:bg-green-50 transition-colors whitespace-nowrap">
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link key={item.href} href={item.href} className="text-sm font-medium text-gray-500 hover:text-green-deep transition-colors">
                {item.label}
              </Link>
            )
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

          {/* Subscribe CTA */}
          <Link href="/insights#subscribe" className="px-3.5 py-1.5 bg-green-deep text-white text-[12px] font-bold rounded-md hover:bg-green-light transition-colors">
            {t('구독', 'Subscribe')}
          </Link>

          {/* Admin */}
          <Link href="/admin" className="text-[12px] font-medium text-gray-400 hover:text-green-deep transition-colors">
            Admin
          </Link>
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
            'children' in item ? (
              <div key={item.label}>
                <div className="text-sm font-semibold text-gray-700 py-2">{item.label}</div>
                <div className="pl-3 border-l border-border ml-1 space-y-1">
                  {item.children.map(c => (
                    <Link key={c.href} href={c.href} onClick={() => setMobileOpen(false)}
                      className="block text-sm font-medium text-gray-500 py-1.5">
                      {c.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                className="block text-sm font-medium text-gray-600 py-2">
                {item.label}
              </Link>
            )
          ))}
          <div className="flex gap-2 pt-2 items-center">
            {(['ko', 'en'] as const).map(l => (
              <button key={l} onClick={() => { setLang(l); setMobileOpen(false); }}
                className={`px-3 py-1.5 text-xs font-bold rounded ${lang === l ? 'bg-green-deep text-white' : 'bg-gray-100 text-gray-500'}`}>
                {l === 'ko' ? '한국어' : 'English'}
              </button>
            ))}
            <Link href="/admin" onClick={() => setMobileOpen(false)}
              className="ml-auto px-3 py-1.5 bg-green-deep text-white text-xs font-bold rounded">
              Admin
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
