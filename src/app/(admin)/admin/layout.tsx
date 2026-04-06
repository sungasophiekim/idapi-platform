// src/app/(admin)/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@/components/ui';

const NAV = [
  { href: '/admin', icon: 'home', label: 'Dashboard' },
  { href: '/admin/posts', icon: 'file', label: 'Posts' },
  { href: '/admin/team', icon: 'users', label: 'Team' },
  { href: '/admin/regulations', icon: 'globe', label: 'Regulations' },
  { href: '/admin/bills', icon: 'shield', label: 'Bill Collector' },
  { href: '/admin/trends', icon: 'search', label: 'Trends' },
  { href: '/admin/briefings', icon: 'file', label: 'Briefings' },
  { href: '/admin/users', icon: 'users', label: 'Users' },
  { href: '/admin/settings', icon: 'settings', label: 'Settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user || !['ADMIN', 'RESEARCHER', 'EDITOR'].includes(d.user.role)) {
        router.push('/admin/login');
      } else {
        setUser(d.user);
      }
      setLoading(false);
    }).catch(() => { router.push('/admin/login'); setLoading(false); });
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;
  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-[220px] bg-[#fafaf9] border-r border-border fixed inset-y-0 left-0 flex flex-col">
        <div className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-green-deep rounded-md flex items-center justify-center text-white font-bold text-[10px]">ID</div>
            <div><div className="font-bold text-[14px]">IDAPI</div><div className="text-[10px] text-gray-400">Admin Panel</div></div>
          </div>
        </div>
        <nav className="flex-1 px-2.5 py-3 space-y-0.5">
          {NAV.map(item => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] transition-all ${active ? 'bg-green-pale text-green-deep font-semibold' : 'text-gray-500 hover:bg-gray-100'}`}>
                <Icon name={item.icon} size={16} /> {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-5 py-4 border-t border-border space-y-2">
          <div className="text-[13px] text-gray-500">{user.name}</div>
          <Link href="/" className="block text-[13px] text-gray-400 hover:text-green-deep">View Site</Link>
          <button onClick={handleLogout} className="text-[13px] text-red-400 hover:text-red-600">Logout</button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-[220px] flex-1 p-8 bg-[#f8f9f7]">
        {children}
      </main>
    </div>
  );
}
