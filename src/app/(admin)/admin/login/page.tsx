// src/app/(admin)/admin/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Btn, InputField } from '@/components/ui';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@idapi.kr');
  const [password, setPassword] = useState('admin123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); }
      else { router.push('/admin'); }
    } catch { setError('Login failed'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9f7]">
      <div className="w-[380px] bg-white border border-border rounded-2xl p-9">
        <div className="flex items-center gap-2.5 mb-7">
          <div className="w-9 h-9 bg-green-deep rounded-lg flex items-center justify-center text-white font-bold text-[12px]">ID</div>
          <div className="font-bold text-lg">IDAPI Admin</div>
        </div>
        <InputField label="Email" value={email} onChange={setEmail} type="email" />
        <InputField label="Password" value={password} onChange={setPassword} type="password" />
        {error && <p className="text-red-500 text-[13px] mb-3">{error}</p>}
        <Btn onClick={handleLogin} disabled={loading} className="w-full justify-center">
          {loading ? 'Signing in...' : 'Sign In'}
        </Btn>
        <p className="text-[12px] text-gray-400 text-center mt-4">Default: admin@idapi.kr / admin123!</p>
      </div>
    </div>
  );
}
