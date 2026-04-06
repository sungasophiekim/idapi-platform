// src/app/(admin)/admin/team/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Btn, Badge, Icon, InputField, SelectField } from '@/components/ui';

export default function AdminTeamPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/team?all=true');
    const data = await res.json();
    setMembers(data.members || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    const payload = {
      ...editing,
      credentials: typeof editing.credentials === 'string'
        ? editing.credentials.split('\n').filter(Boolean)
        : editing.credentials,
      credentialsEn: typeof editing.credentialsEn === 'string'
        ? editing.credentialsEn.split('\n').filter(Boolean)
        : editing.credentialsEn,
    };

    if (editing.id) {
      await fetch(`/api/team/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    setEditing(null);
    load();
  };

  const newMember = () => setEditing({
    name: '', nameEn: '', title: '', titleEn: '',
    bio: '', bioEn: '', credentials: '', credentialsEn: '',
    memberType: 'FELLOW', isPublished: true, sortOrder: members.length,
  });

  // ─── Edit Form ───
  if (editing) {
    const f = editing;
    const set = (k: string, v: any) => setEditing({ ...f, [k]: v });
    const credsStr = Array.isArray(f.credentials) ? f.credentials.join('\n') : f.credentials || '';
    const credsEnStr = Array.isArray(f.credentialsEn) ? f.credentialsEn.join('\n') : f.credentialsEn || '';

    return (
      <div>
        <button onClick={() => setEditing(null)} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-green-deep mb-5">
          <Icon name="back" size={16} /> Back
        </button>
        <h1 className="text-2xl font-bold mb-6">{f.id ? 'Edit Member' : 'New Member'}</h1>
        <div className="bg-white border border-border rounded-xl p-7 space-y-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Name (KO)" value={f.name} onChange={v => set('name', v)} placeholder="이름" />
            <InputField label="Name (EN)" value={f.nameEn || ''} onChange={v => set('nameEn', v)} placeholder="English name" />
            <InputField label="Title (KO)" value={f.title} onChange={v => set('title', v)} placeholder="직함" />
            <InputField label="Title (EN)" value={f.titleEn || ''} onChange={v => set('titleEn', v)} placeholder="Title" />
          </div>
          <InputField label="Bio (KO)" value={f.bio || ''} onChange={v => set('bio', v)} multiline placeholder="소개글..." />
          <InputField label="Bio (EN)" value={f.bioEn || ''} onChange={v => set('bioEn', v)} multiline placeholder="Biography..." />
          <InputField label="Credentials KO (one per line)" value={credsStr} onChange={v => set('credentials', v)} multiline />
          <InputField label="Credentials EN (one per line)" value={credsEnStr} onChange={v => set('credentialsEn', v)} multiline />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectField label="Type" value={f.memberType} onChange={v => set('memberType', v)}
              options={[{ value: 'FOUNDER', label: 'Founder' }, { value: 'FELLOW', label: 'Fellow' }, { value: 'ADVISOR', label: 'Advisor' }, { value: 'ASSOCIATE', label: 'Associate' }]} />
            <SelectField label="Published" value={f.isPublished ? 'true' : 'false'} onChange={v => set('isPublished', v === 'true')}
              options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]} />
            <InputField label="Sort Order" value={String(f.sortOrder || 0)} onChange={v => set('sortOrder', parseInt(v) || 0)} type="number" />
          </div>
          <div className="flex gap-3 pt-2">
            <Btn onClick={handleSave}>Save Member</Btn>
            <Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn>
          </div>
        </div>
      </div>
    );
  }

  // ─── List ───
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Team Members</h1>
        <Btn size="sm" onClick={newMember}><Icon name="plus" size={14} /> Add Member</Btn>
      </div>
      <div className="space-y-3">
        {members.map(m => (
          <div key={m.id} className="bg-white border border-border rounded-xl px-5 py-4 flex items-center gap-3.5">
            <div className="w-10 h-10 bg-green-pale rounded-full flex items-center justify-center font-bold text-green-deep shrink-0">
              {m.name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-semibold">{m.name} <span className="text-gray-400 font-normal">({m.nameEn})</span></div>
              <div className="text-[13px] text-green-deep">{m.title}</div>
            </div>
            <Badge color={m.isPublished ? 'green' : 'gray'}>{m.isPublished ? 'Published' : 'Hidden'}</Badge>
            <Badge color="blue">{m.memberType}</Badge>
            <button onClick={() => setEditing({ ...m })} className="text-gray-400 hover:text-green-deep"><Icon name="edit" size={15} /></button>
          </div>
        ))}
        {members.length === 0 && <div className="py-10 text-center text-gray-400">No team members. Add your first one!</div>}
      </div>
    </div>
  );
}
