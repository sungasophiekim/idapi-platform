// src/app/(admin)/admin/posts/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Btn, Badge, Icon, InputField, SelectField } from '@/components/ui';
import { CATEGORIES, RESEARCH_AREAS } from '@/types';

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const router = useRouter();

  const load = useCallback(async () => {
    const res = await fetch('/api/posts?status=all&limit=50');
    const data = await res.json();
    setPosts(data.posts || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    const method = editing.id ? 'PUT' : 'POST';
    const url = editing.id ? `/api/posts/${editing.id}` : '/api/posts';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    });
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    load();
  };

  const newPost = () => setEditing({
    title: '', titleEn: '', slug: '', excerpt: '', excerptEn: '',
    content: '', contentEn: '',
    category: 'COMMENTARY', researchArea: 'KOREA_POLICY', status: 'DRAFT',
    publishedAt: new Date().toISOString().slice(0, 10), tags: [],
  });

  // ─── Edit Form ───
  if (editing) {
    const f = editing;
    const set = (k: string, v: any) => setEditing({ ...f, [k]: v });
    // Auto-generate slug from title
    const autoSlug = () => {
      if (!f.slug && f.titleEn) {
        set('slug', f.titleEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/,''));
      }
    };

    return (
      <div>
        <button onClick={() => setEditing(null)} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-green-deep mb-5">
          <Icon name="back" size={16} /> Back to list
        </button>
        <h1 className="text-2xl font-bold mb-6">{f.id ? 'Edit Post' : 'New Post'}</h1>
        <div className="bg-white border border-border rounded-xl p-7 space-y-1">
          <InputField label="Title (KO)" value={f.title} onChange={v => set('title', v)} placeholder="제목 입력..." />
          <InputField label="Title (EN)" value={f.titleEn || ''} onChange={v => set('titleEn', v)} placeholder="English title..." />
          <InputField label="Slug (URL)" value={f.slug || ''} onChange={v => set('slug', v)} placeholder="auto-generated-from-title">
          </InputField>
          <button onClick={autoSlug} className="text-[12px] text-green-deep font-medium -mt-2 mb-3 block">Auto-generate from EN title</button>
          <InputField label="Excerpt (KO)" value={f.excerpt || ''} onChange={v => set('excerpt', v)} multiline placeholder="간략한 요약..." />
          <InputField label="Excerpt (EN)" value={f.excerptEn || ''} onChange={v => set('excerptEn', v)} multiline placeholder="Brief summary..." />
          <InputField label="Content (KO)" value={f.content || ''} onChange={v => set('content', v)} multiline placeholder="본문 내용..." />
          <InputField label="Content (EN)" value={f.contentEn || ''} onChange={v => set('contentEn', v)} multiline placeholder="Full content..." />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectField label="Category" value={f.category} onChange={v => set('category', v)}
              options={Object.entries(CATEGORIES).map(([k, v]) => ({ value: k, label: v.en }))} />
            <SelectField label="Research Area" value={f.researchArea} onChange={v => set('researchArea', v)}
              options={Object.entries(RESEARCH_AREAS).map(([k, v]) => ({ value: k, label: v.en }))} />
            <SelectField label="Status" value={f.status} onChange={v => set('status', v)}
              options={[{ value: 'DRAFT', label: 'Draft' }, { value: 'REVIEW', label: 'Review' }, { value: 'PUBLISHED', label: 'Published' }, { value: 'ARCHIVED', label: 'Archived' }]} />
          </div>
          <InputField label="Publish Date" value={f.publishedAt || ''} onChange={v => set('publishedAt', v)} type="date" />

          <div className="flex gap-3 pt-2">
            <Btn onClick={handleSave}>Save Post</Btn>
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
        <h1 className="text-2xl font-bold">Posts</h1>
        <Btn size="sm" onClick={newPost}><Icon name="plus" size={14} /> New Post</Btn>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        {posts.map((p: any, i: number) => (
          <div key={p.id} className={`flex items-center gap-3 px-5 py-3.5 ${i < posts.length - 1 ? 'border-b border-gray-100' : ''}`}>
            <Badge color={p.status === 'PUBLISHED' ? 'green' : p.status === 'DRAFT' ? 'amber' : 'gray'}>{p.status}</Badge>
            <Badge>{CATEGORIES[p.category as keyof typeof CATEGORIES]?.en || p.category}</Badge>
            <div className="flex-1 text-[14px] font-medium truncate">{p.title}</div>
            <div className="text-[12px] text-gray-400 hidden md:block">{p.publishedAt?.slice(0, 10)}</div>
            <div className="text-[12px] text-gray-300 flex items-center gap-1"><Icon name="eye" size={13} />{p.viewCount}</div>
            <button onClick={() => setEditing({ ...p })} className="text-gray-400 hover:text-green-deep"><Icon name="edit" size={15} /></button>
            <button onClick={() => handleDelete(p.id)} className="text-gray-400 hover:text-red-500"><Icon name="trash" size={15} /></button>
          </div>
        ))}
        {posts.length === 0 && <div className="py-10 text-center text-gray-400">No posts yet. Create your first one!</div>}
      </div>
    </div>
  );
}
