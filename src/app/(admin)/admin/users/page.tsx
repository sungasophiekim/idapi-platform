'use client';

import { useState, useEffect } from 'react';
import { Btn, InputField, SelectField, Icon, Badge } from '@/components/ui';

interface User {
  id: string;
  email: string;
  name: string;
  nameEn: string | null;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

const ROLES = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'RESEARCHER', label: 'Researcher' },
  { value: 'EDITOR', label: 'Editor' },
  { value: 'VIEWER', label: 'Viewer' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '', nameEn: '', role: 'VIEWER', id: '' });
  const [error, setError] = useState('');

  const load = async () => {
    const res = await fetch('/api/users');
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
    }
  };

  useEffect(() => { load(); }, []);

  const startCreate = () => {
    setForm({ email: '', password: '', name: '', nameEn: '', role: 'VIEWER', id: '' });
    setError('');
    setEditing(true);
  };

  const startEdit = (u: User) => {
    setForm({ email: u.email, password: '', name: u.name, nameEn: u.nameEn || '', role: u.role, id: u.id });
    setError('');
    setEditing(true);
  };

  const save = async () => {
    setError('');
    const isNew = !form.id;
    const url = isNew ? '/api/users' : `/api/users/${form.id}`;
    const method = isNew ? 'POST' : 'PUT';

    const body: Record<string, string> = { name: form.name, role: form.role };
    if (form.nameEn) body.nameEn = form.nameEn;
    if (isNew) {
      body.email = form.email;
      body.password = form.password;
    } else if (form.password) {
      body.password = form.password;
    }

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to save');
      return;
    }

    setEditing(false);
    load();
  };

  const toggleActive = async (u: User) => {
    await fetch(`/api/users/${u.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !u.isActive }),
    });
    load();
  };

  const del = async (u: User) => {
    if (!confirm(`Delete user ${u.email}?`)) return;
    const res = await fetch(`/api/users/${u.id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || 'Failed to delete');
      return;
    }
    load();
  };

  if (editing) return (
    <div>
      <button onClick={() => setEditing(false)} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-green-deep cursor-pointer mb-5">
        <Icon name="back" size={16} /> Back
      </button>
      <h1 className="text-2xl font-bold mb-6">{form.id ? 'Edit User' : 'New User'}</h1>
      <div className="bg-white border border-border rounded-xl p-7">
        {!form.id && <InputField label="Email" value={form.email} onChange={v => setForm({ ...form, email: v })} type="email" />}
        {form.id && <p className="text-sm text-gray-500 mb-4">Email: <strong>{form.email}</strong></p>}
        <InputField label="Password" value={form.password} onChange={v => setForm({ ...form, password: v })} type="password" placeholder={form.id ? 'Leave empty to keep current' : 'Min 8 characters'} />
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Name" value={form.name} onChange={v => setForm({ ...form, name: v })} />
          <InputField label="Name (EN)" value={form.nameEn} onChange={v => setForm({ ...form, nameEn: v })} />
        </div>
        <SelectField label="Role" value={form.role} onChange={v => setForm({ ...form, role: v })} options={ROLES} />
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <div className="flex gap-3 mt-2">
          <Btn onClick={save}>Save</Btn>
          <Btn variant="ghost" onClick={() => setEditing(false)}>Cancel</Btn>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <Btn size="sm" onClick={startCreate}><Icon name="plus" size={14} /> Add User</Btn>
      </div>
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        {users.map((u, i) => (
          <div key={u.id} className={`flex items-center gap-3 px-5 py-3.5 ${i < users.length - 1 ? 'border-b border-gray-100' : ''}`}>
            <div className="w-9 h-9 bg-green-pale rounded-full flex items-center justify-center font-bold text-green-deep text-sm shrink-0">
              {u.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold">{u.name} {u.nameEn && <span className="text-gray-400 font-normal">({u.nameEn})</span>}</div>
              <div className="text-xs text-gray-400">{u.email}</div>
            </div>
            <Badge color={u.role === 'ADMIN' ? 'red' : u.role === 'RESEARCHER' ? 'blue' : 'gray'}>{u.role}</Badge>
            <Badge color={u.isActive ? 'green' : 'gray'}>{u.isActive ? 'Active' : 'Inactive'}</Badge>
            <div className="text-xs text-gray-400 hidden sm:block w-24">
              {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}
            </div>
            <button onClick={() => toggleActive(u)} className="text-gray-400 hover:text-green-deep" aria-label={u.isActive ? 'Deactivate' : 'Activate'}>
              <Icon name={u.isActive ? 'eye' : 'x'} size={15} />
            </button>
            <button onClick={() => startEdit(u)} className="text-gray-400 hover:text-green-deep" aria-label="Edit user">
              <Icon name="edit" size={15} />
            </button>
            <button onClick={() => del(u)} className="text-gray-400 hover:text-red-500" aria-label="Delete user">
              <Icon name="trash" size={15} />
            </button>
          </div>
        ))}
        {users.length === 0 && <div className="p-10 text-center text-gray-400">No users found</div>}
      </div>
    </div>
  );
}
