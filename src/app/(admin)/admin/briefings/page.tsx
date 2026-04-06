// src/app/(admin)/admin/briefings/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Btn, Badge, Icon, InputField, SelectField } from '@/components/ui';

export default function AdminBriefingsPage() {
  const [briefings, setBriefings] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [viewing, setViewing] = useState<any>(null);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    // Fetch all briefings (including unpublished) — need an admin endpoint
    const res = await fetch('/api/briefings?all=true');
    const data = await res.json();
    setBriefings(data.briefings || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const generateBriefing = async () => {
    setGenerating(true);
    setMessage('');
    try {
      const res = await fetch('/api/briefings', { method: 'POST' });
      const data = await res.json();
      if (data.error) {
        setMessage(`Error: ${data.error}`);
      } else {
        setMessage('Briefing generated. Review before publishing.');
        load();
      }
    } catch {
      setMessage('Generation failed');
    }
    setGenerating(false);
  };

  const togglePublish = async (id: string, publish: boolean) => {
    await fetch(`/api/briefings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isPublished: publish,
        publishedAt: publish ? new Date().toISOString() : null,
      }),
    });
    load();
    if (viewing?.id === id) setViewing({ ...viewing, isPublished: publish });
  };

  const deleteBriefing = async (id: string) => {
    if (!confirm('Delete this briefing?')) return;
    await fetch(`/api/briefings/${id}`, { method: 'DELETE' });
    if (viewing?.id === id) setViewing(null);
    load();
  };

  // ─── Detail View ───
  if (viewing) {
    return (
      <div>
        <button onClick={() => setViewing(null)} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-green-deep mb-5">
          <Icon name="back" size={16} /> Back to list
        </button>

        <div className="flex items-center gap-3 mb-6">
          <Badge color={viewing.isPublished ? 'green' : 'amber'}>{viewing.isPublished ? 'Published' : 'Draft'}</Badge>
          <Badge color="blue">{viewing.type}</Badge>
          <span className="text-[13px] text-gray-400">{viewing.generatedAt?.slice(0, 16).replace('T', ' ')}</span>
        </div>

        <div className="bg-white border border-[#e8e8e6] rounded-xl p-8 mb-4">
          <h1 className="text-[22px] font-bold mb-2">{viewing.title}</h1>
          {viewing.titleEn && <h2 className="text-[16px] text-gray-500 mb-6">{viewing.titleEn}</h2>}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Korean */}
            <div>
              <div className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-3">Korean</div>
              <div className="text-[14px] text-gray-600 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg p-4 border border-gray-100">
                {viewing.content}
              </div>
            </div>

            {/* English */}
            <div>
              <div className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-3">English</div>
              <div className="text-[14px] text-gray-600 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg p-4 border border-gray-100">
                {viewing.contentEn || 'No English version generated.'}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {viewing.isPublished ? (
            <Btn variant="ghost" onClick={() => togglePublish(viewing.id, false)}>
              Unpublish
            </Btn>
          ) : (
            <Btn onClick={() => togglePublish(viewing.id, true)}>
              <Icon name="eye" size={14} /> Publish to Dashboard
            </Btn>
          )}
          <Btn variant="danger" onClick={() => deleteBriefing(viewing.id)}>
            <Icon name="trash" size={14} /> Delete
          </Btn>
        </div>
      </div>
    );
  }

  // ─── List View ───
  return (
    <div>
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">AI Briefings</h1>
          <p className="text-[13px] text-gray-400 mt-1">
            AI-generated policy briefings require human review before publishing
          </p>
        </div>
        <Btn size="sm" onClick={generateBriefing} disabled={generating}>
          {generating ? (
            <><span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
          ) : (
            <><Icon name="plus" size={14} /> Generate Briefing</>
          )}
        </Btn>
      </div>

      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-[13px] ${message.startsWith('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
          {message}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total', value: briefings.length, color: 'text-gray-700' },
          { label: 'Published', value: briefings.filter(b => b.isPublished).length, color: 'text-green-700' },
          { label: 'Pending Review', value: briefings.filter(b => !b.isPublished).length, color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-[#e8e8e6] rounded-xl p-4">
            <div className="text-[12px] text-gray-400">{s.label}</div>
            <div className={`text-[24px] font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Briefing List */}
      <div className="space-y-2">
        {briefings.map(b => (
          <div key={b.id} onClick={() => setViewing(b)}
            className="bg-white border border-[#e8e8e6] rounded-xl p-5 hover:border-green-deep/30 hover:shadow-sm transition-all cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <Badge color={b.isPublished ? 'green' : 'amber'}>{b.isPublished ? 'Published' : 'Pending'}</Badge>
              <Badge color="blue">{b.type}</Badge>
              <span className="text-[12px] text-gray-400">{b.generatedAt?.slice(0, 16).replace('T', ' ')}</span>
              <div className="ml-auto flex gap-1.5">
                {!b.isPublished && (
                  <button onClick={(e) => { e.stopPropagation(); togglePublish(b.id, true); }}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-green-50 text-green-700 hover:bg-green-100">
                    Publish
                  </button>
                )}
                <button onClick={(e) => { e.stopPropagation(); deleteBriefing(b.id); }}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100">
                  Delete
                </button>
              </div>
            </div>
            <h3 className="text-[15px] font-semibold mb-1">{b.title}</h3>
            <p className="text-[13px] text-gray-400 line-clamp-2 leading-relaxed">{b.content?.slice(0, 200)}...</p>
          </div>
        ))}
        {briefings.length === 0 && (
          <div className="bg-white border border-dashed border-gray-200 rounded-xl py-16 text-center">
            <Icon name="file" size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 text-[14px]">No briefings yet</p>
            <p className="text-gray-300 text-[12px] mt-1">Click "Generate Briefing" to create one from recent regulations</p>
          </div>
        )}
      </div>
    </div>
  );
}
