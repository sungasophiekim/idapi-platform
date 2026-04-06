// src/app/(admin)/admin/regulations/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Btn, Badge, Icon, InputField, SelectField } from '@/components/ui';

const JURISDICTIONS = [
  { value: 'KR', label: '🇰🇷 Korea' }, { value: 'US', label: '🇺🇸 United States' },
  { value: 'EU', label: '🇪🇺 European Union' }, { value: 'SG', label: '🇸🇬 Singapore' },
  { value: 'JP', label: '🇯🇵 Japan' }, { value: 'UK', label: '🇬🇧 United Kingdom' },
  { value: 'HK', label: '🇭🇰 Hong Kong' }, { value: 'INTL', label: '🌐 International' },
];

const STATUSES = [
  { value: 'PROPOSED', label: 'Proposed' }, { value: 'COMMITTEE', label: 'Committee' },
  { value: 'FLOOR_VOTE', label: 'Floor Vote' }, { value: 'PASSED', label: 'Passed' },
  { value: 'ENACTED', label: 'Enacted' }, { value: 'REJECTED', label: 'Rejected' },
  { value: 'WITHDRAWN', label: 'Withdrawn' },
];

const STATUS_COLORS: Record<string, string> = {
  PROPOSED: 'blue', COMMITTEE: 'amber', FLOOR_VOTE: 'amber',
  PASSED: 'green', ENACTED: 'green', REJECTED: 'red', WITHDRAWN: 'gray',
};

export default function AdminRegulationsPage() {
  const [regs, setRegs] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    const res = await fetch('/api/regulations?limit=50');
    const data = await res.json();
    setRegs(data.regulations || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    const method = editing.id ? 'PUT' : 'POST';
    const url = editing.id ? `/api/regulations/${editing.id}` : '/api/regulations';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    });
    setEditing(null);
    load();
  };

  const handleAiAnalyze = async (id: string) => {
    setAiLoading(true);
    setMessage('');
    try {
      const res = await fetch(`/api/regulations/${id}`, { method: 'POST' });
      const data = await res.json();
      if (data.error) setMessage(`Error: ${data.error}`);
      else setMessage(`AI analysis complete. Impact score: ${data.analysis?.impactScore}/10`);
      load();
    } catch { setMessage('AI analysis failed'); }
    setAiLoading(false);
  };

  const handleGenerateBriefing = async () => {
    setBriefingLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/briefings', { method: 'POST' });
      const data = await res.json();
      if (data.error) setMessage(`Error: ${data.error}`);
      else setMessage('Daily briefing generated! Review it before publishing.');
    } catch { setMessage('Briefing generation failed'); }
    setBriefingLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this regulation?')) return;
    await fetch(`/api/regulations/${id}`, { method: 'DELETE' });
    load();
  };

  const newReg = () => setEditing({
    jurisdiction: 'KR', status: 'PROPOSED', title: '', titleEn: '',
    summary: '', summaryEn: '', sourceUrl: '', sourceName: '', billNumber: '',
    rawContent: '', tags: [], runAiAnalysis: false, proposedDate: new Date().toISOString().slice(0, 10),
  });

  // ─── Edit Form ───
  if (editing) {
    const f = editing;
    const set = (k: string, v: any) => setEditing({ ...f, [k]: v });

    return (
      <div>
        <button onClick={() => setEditing(null)} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-green-deep mb-5">
          <Icon name="back" size={16} /> Back
        </button>
        <h1 className="text-2xl font-bold mb-6">{f.id ? 'Edit Regulation' : 'Add Regulation'}</h1>
        <div className="bg-white border border-[#e8e8e6] rounded-xl p-7 space-y-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectField label="Jurisdiction" value={f.jurisdiction} onChange={v => set('jurisdiction', v)} options={JURISDICTIONS} />
            <SelectField label="Status" value={f.status} onChange={v => set('status', v)} options={STATUSES} />
            <InputField label="Bill Number" value={f.billNumber || ''} onChange={v => set('billNumber', v)} placeholder="e.g. HR-1234" />
          </div>
          <InputField label="Title (KO)" value={f.title} onChange={v => set('title', v)} placeholder="법안/규제 제목" />
          <InputField label="Title (EN)" value={f.titleEn || ''} onChange={v => set('titleEn', v)} placeholder="English title" />
          <InputField label="Summary (KO)" value={f.summary || ''} onChange={v => set('summary', v)} multiline placeholder="간략 요약..." />
          <InputField label="Summary (EN)" value={f.summaryEn || ''} onChange={v => set('summaryEn', v)} multiline placeholder="Brief summary..." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Source Name" value={f.sourceName || ''} onChange={v => set('sourceName', v)} placeholder="e.g. 금융위원회, SEC" />
            <InputField label="Source URL" value={f.sourceUrl || ''} onChange={v => set('sourceUrl', v)} placeholder="https://..." />
          </div>
          <InputField label="Proposed Date" value={f.proposedDate || ''} onChange={v => set('proposedDate', v)} type="date" />

          {/* Raw content for AI analysis */}
          <InputField label="Raw Content (for AI analysis)" value={f.rawContent || ''} onChange={v => set('rawContent', v)} multiline placeholder="Paste the full regulation text here. AI will analyze it to generate summary, impact score, and tags." />

          {f.rawContent && !f.id && (
            <label className="flex items-center gap-2 text-[13px] text-gray-600 mt-2 mb-4 cursor-pointer">
              <input type="checkbox" checked={f.runAiAnalysis || false} onChange={e => set('runAiAnalysis', e.target.checked)} className="w-4 h-4 accent-green-800" />
              Run AI analysis on save (auto-generates summary, impact score, and tags)
            </label>
          )}

          <div className="flex gap-3 pt-2">
            <Btn onClick={handleSave}>Save Regulation</Btn>
            <Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn>
          </div>
        </div>
      </div>
    );
  }

  // ─── List ───
  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Regulation Tracker</h1>
        <div className="flex gap-2">
          <Btn size="sm" variant="outline" onClick={handleGenerateBriefing} disabled={briefingLoading}>
            {briefingLoading ? 'Generating...' : 'Generate Daily Briefing'}
          </Btn>
          <Btn size="sm" onClick={newReg}><Icon name="plus" size={14} /> Add Regulation</Btn>
        </div>
      </div>

      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-[13px] ${message.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-800'}`}>
          {message}
        </div>
      )}

      <div className="bg-white border border-[#e8e8e6] rounded-xl overflow-hidden">
        {regs.map((r: any, i: number) => (
          <div key={r.id} className={`flex items-center gap-3 px-5 py-4 ${i < regs.length - 1 ? 'border-b border-gray-100' : ''}`}>
            <span className="text-[16px]">{JURISDICTIONS.find(j => j.value === r.jurisdiction)?.label.slice(0, 2)}</span>
            <Badge color={STATUS_COLORS[r.status] || 'gray'}>{r.status}</Badge>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold truncate">{r.title}</div>
              {r.aiSummary && <div className="text-[12px] text-gray-400 truncate mt-0.5">{r.aiSummary}</div>}
            </div>
            {r.impactScore && (
              <div className={`text-[12px] font-bold px-2 py-0.5 rounded ${r.impactScore >= 8 ? 'bg-red-50 text-red-600' : r.impactScore >= 5 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                {r.impactScore}/10
              </div>
            )}
            <div className="flex gap-1.5">
              {r.rawContent && (
                <button onClick={() => handleAiAnalyze(r.id)} disabled={aiLoading}
                  className="text-[11px] px-2 py-1 rounded bg-purple-50 text-purple-600 hover:bg-purple-100 disabled:opacity-50"
                  title="Run AI Analysis">
                  AI
                </button>
              )}
              <button onClick={() => setEditing({ ...r })} className="text-gray-400 hover:text-green-deep"><Icon name="edit" size={15} /></button>
              <button onClick={() => handleDelete(r.id)} className="text-gray-400 hover:text-red-500"><Icon name="trash" size={15} /></button>
            </div>
          </div>
        ))}
        {regs.length === 0 && <div className="py-12 text-center text-gray-400">No regulations tracked yet. Add your first one!</div>}
      </div>
    </div>
  );
}
