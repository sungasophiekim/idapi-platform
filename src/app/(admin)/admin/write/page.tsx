// src/app/(admin)/admin/write/page.tsx — AI editor-in-chief writing workspace
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Btn, Icon } from '@/components/ui';
import Markdown from '@/components/Markdown';

const CATEGORIES = [
  { v: 'POLICY_BRIEF', l: '정책브리프' },
  { v: 'COMMENTARY', l: '논평' },
  { v: 'REPORT', l: '보고서' },
  { v: 'SEMINAR', l: '세미나 노트' },
  { v: 'PRESS_RELEASE', l: '보도자료' },
];

const STAGES = ['IDEA', 'FRAME', 'DRAFTING', 'AI_REVIEW', 'EDITOR_REVIEW', 'REVISION', 'READY', 'PUBLISHED'];
const STAGE_KO: Record<string, string> = {
  IDEA: '아이디어', FRAME: '가이드 틀', DRAFTING: '집필', AI_REVIEW: 'AI 리뷰',
  EDITOR_REVIEW: '편집장 검토', REVISION: '수정', READY: '준비 완료', PUBLISHED: '발행됨',
};

interface Draft {
  id: string; idea?: string; frame?: string; title?: string; titleEn?: string;
  excerpt?: string; content?: string; contentEn?: string; category: string;
  researchArea: string; stage: string; reviewNotes?: any[]; postId?: string;
}

export default function WritePage() {
  const [list, setList] = useState<any[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState('');
  const [role, setRole] = useState('');
  const [newIdea, setNewIdea] = useState('');
  const [newCat, setNewCat] = useState('POLICY_BRIEF');
  const [showEn, setShowEn] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const isEditor = role === 'ADMIN' || role === 'EDITOR';

  const loadList = useCallback(async () => {
    const d = await (await fetch('/api/admin/drafts')).json();
    setList(d.drafts || []);
  }, []);

  useEffect(() => {
    loadList();
    fetch('/api/auth/me').then(r => r.json()).then(d => setRole(d.user?.role || ''));
  }, [loadList]);

  async function openDraft(id: string) {
    const d = await (await fetch(`/api/admin/drafts?id=${id}`)).json();
    setDraft(d.draft); setShowEn(false);
  }

  async function createDraft() {
    if (!newIdea.trim()) return;
    setBusy('create');
    const d = await (await fetch('/api/admin/drafts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea: newIdea, category: newCat }),
    })).json();
    setNewIdea(''); setDraft(d.draft); loadList(); setBusy('');
  }

  async function ai(action: string, extra: any = {}) {
    if (!draft) return;
    setBusy(action);
    try {
      const r = await fetch('/api/admin/drafts/ai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: draft.id, action, ...extra }),
      });
      const d = await r.json();
      if (d.draft) setDraft(d.draft);
      else if (!r.ok) alert(d.error || 'AI 실패');
    } finally { setBusy(''); loadList(); }
  }

  async function patch(data: Partial<Draft>) {
    if (!draft) return;
    const d = await (await fetch('/api/admin/drafts', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: draft.id, ...data }),
    })).json();
    if (d.draft) setDraft(prev => ({ ...prev!, ...d.draft }));
    loadList();
  }

  async function publish() {
    if (!draft) return;
    setBusy('publish');
    const r = await fetch('/api/admin/drafts/publish', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: draft.id }),
    });
    const d = await r.json();
    setBusy('');
    if (r.ok) { alert('발행 완료'); openDraft(draft.id); }
    else alert(d.error || '발행 실패');
  }

  // Markdown toolbar — wrap/insert around selection
  function wrap(before: string, after = before) {
    const ta = taRef.current; if (!ta || !draft) return;
    const [s, e] = [ta.selectionStart, ta.selectionEnd];
    const val = draft.content || '';
    const next = val.slice(0, s) + before + val.slice(s, e) + after + val.slice(e);
    setDraft({ ...draft, content: next });
    requestAnimationFrame(() => { ta.focus(); ta.selectionStart = s + before.length; ta.selectionEnd = e + before.length; });
  }
  function prefix(p: string) {
    const ta = taRef.current; if (!ta || !draft) return;
    const s = ta.selectionStart; const val = draft.content || '';
    const ls = val.lastIndexOf('\n', s - 1) + 1;
    setDraft({ ...draft, content: val.slice(0, ls) + p + val.slice(ls) });
  }

  const review = draft?.reviewNotes?.[0];

  return (
    <div className="flex h-[calc(100vh-0px)]">
      {/* Sidebar */}
      <aside className="w-56 border-r border-border p-4 overflow-y-auto shrink-0">
        <h2 className="text-sm font-bold mb-3">집필 · AI 편집장</h2>
        <div className="bg-bg-alt rounded-lg p-3 mb-4">
          <textarea value={newIdea} onChange={e => setNewIdea(e.target.value)} rows={3}
            placeholder="새 글 아이디어·핵심 논점…"
            className="w-full text-[12px] p-2 rounded border border-gray-200 outline-none resize-none" />
          <select value={newCat} onChange={e => setNewCat(e.target.value)}
            className="w-full text-[12px] mt-2 p-1.5 rounded border border-gray-200">
            {CATEGORIES.map(c => <option key={c.v} value={c.v}>{c.l}</option>)}
          </select>
          <button onClick={createDraft} disabled={busy === 'create'}
            className="w-full mt-2 py-1.5 bg-green-deep text-white text-[12px] font-bold rounded disabled:opacity-60">
            {busy === 'create' ? '생성 중…' : '새 글 시작'}
          </button>
        </div>
        <div className="space-y-1">
          {list.map(d => (
            <button key={d.id} onClick={() => openDraft(d.id)}
              className={`w-full text-left px-2.5 py-2 rounded text-[12px] ${draft?.id === d.id ? 'bg-green-pale text-green-deep font-semibold' : 'hover:bg-gray-50 text-gray-600'}`}>
              <div className="truncate">{d.title || d.category}</div>
              <div className="text-[10px] text-gray-400">{STAGE_KO[d.stage] || d.stage}</div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-6">
        {!draft ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            왼쪽에서 새 글을 시작하거나 기존 초안을 선택하세요.
          </div>
        ) : (
          <div className="max-w-[1100px]">
            {/* Stage stepper */}
            <div className="flex items-center gap-1.5 mb-5 flex-wrap">
              {STAGES.map(s => (
                <span key={s} className={`text-[11px] px-2 py-1 rounded ${draft.stage === s ? 'bg-green-deep text-white font-bold' : 'bg-gray-100 text-gray-400'}`}>
                  {STAGE_KO[s]}
                </span>
              ))}
            </div>

            {/* Idea + frame */}
            <div className="mb-5 bg-bg-alt rounded-xl p-4">
              <div className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-1.5">아이디어</div>
              <p className="text-[13px] text-gray-600 whitespace-pre-wrap">{draft.idea}</p>
              <div className="flex gap-2 mt-3">
                <Btn size="sm" onClick={() => ai('frame')} disabled={!!busy}>
                  {busy === 'frame' ? '생성 중…' : 'AI 가이드 틀 생성'} <Icon name="edit" size={13} />
                </Btn>
                {draft.frame && (
                  <Btn size="sm" variant="outline" onClick={() => ai('draft')} disabled={!!busy}>
                    {busy === 'draft' ? '작성 중…' : '이 틀로 초안 생성'}
                  </Btn>
                )}
              </div>
              {draft.frame && (
                <details className="mt-3">
                  <summary className="text-[12px] font-semibold text-green-deep cursor-pointer">가이드 틀 보기</summary>
                  <div className="mt-2 border border-border rounded-lg p-3 bg-white"><Markdown>{draft.frame}</Markdown></div>
                </details>
              )}
            </div>

            {/* Title / excerpt */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <input value={draft.title || ''} onChange={e => setDraft({ ...draft, title: e.target.value })} onBlur={() => patch({ title: draft.title })}
                placeholder="제목 (KO)" className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold" />
              <input value={draft.titleEn || ''} onChange={e => setDraft({ ...draft, titleEn: e.target.value })} onBlur={() => patch({ titleEn: draft.titleEn })}
                placeholder="Title (EN)" className="px-3 py-2 rounded-lg border border-gray-200 text-sm" />
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-1 mb-2 flex-wrap">
              {[['굵게', () => wrap('**')], ['제목', () => prefix('## ')], ['목록', () => prefix('- ')], ['인용', () => prefix('> ')], ['링크', () => wrap('[', '](url)')]].map(([label, fn]: any) => (
                <button key={label} onClick={fn} className="px-2.5 py-1 text-[12px] border border-gray-200 rounded hover:bg-gray-50">{label}</button>
              ))}
              <div className="ml-auto flex gap-1.5">
                <button onClick={() => patch({ content: draft.content })} className="px-2.5 py-1 text-[12px] font-semibold text-green-deep border border-green-deep/30 rounded hover:bg-green-50">저장</button>
                <button onClick={() => setShowEn(v => !v)} className={`px-2.5 py-1 text-[12px] border rounded ${showEn ? 'bg-green-deep text-white border-green-deep' : 'border-gray-200'}`}>EN</button>
              </div>
            </div>

            {/* Editor + preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5" style={{ minHeight: 380 }}>
              <textarea ref={taRef} value={showEn ? (draft.contentEn || '') : (draft.content || '')}
                onChange={e => setDraft({ ...draft, [showEn ? 'contentEn' : 'content']: e.target.value })}
                onBlur={() => patch(showEn ? { contentEn: draft.contentEn } : { content: draft.content })}
                placeholder="마크다운으로 본문을 작성하세요…"
                className="w-full p-4 rounded-xl border border-gray-200 text-[14px] leading-relaxed font-mono outline-none resize-none" />
              <div className="border border-border rounded-xl p-4 overflow-y-auto bg-white">
                <Markdown>{(showEn ? draft.contentEn : draft.content) || '_미리보기_'}</Markdown>
              </div>
            </div>

            {/* AI editor actions */}
            <div className="flex gap-2 flex-wrap mb-5">
              <Btn size="sm" onClick={() => ai('review')} disabled={!!busy}>{busy === 'review' ? '검토 중…' : 'AI 편집장 리뷰 요청'}</Btn>
              <Btn size="sm" variant="outline" onClick={() => ai('translate', { to: 'en' })} disabled={!!busy}>{busy === 'translate' ? '번역 중…' : 'KO→EN 번역'}</Btn>
              <Btn size="sm" variant="outline" onClick={() => ai('meta')} disabled={!!busy}>제목·요약 생성</Btn>
              <button onClick={() => patch({ stage: 'EDITOR_REVIEW' })} className="px-3 py-1.5 text-[12px] font-medium text-gray-600 border border-gray-200 rounded hover:bg-gray-50">사람 편집장에 검토 요청</button>
            </div>

            {/* Review panel */}
            {review && (
              <div className="border border-border rounded-xl p-5 mb-5 bg-bg-alt">
                <div className="text-[12px] font-bold text-green-deep mb-3">{review.by === 'AI' ? 'AI 편집장' : '편집장'} 리뷰 · {review.at?.slice(0, 10)}</div>
                {[['강점', review.strengths], ['빈틈', review.gaps], ['수정 요청', review.requests], ['검증 체크리스트', review.checklist]].map(([label, items]: any) => items?.length ? (
                  <div key={label} className="mb-3">
                    <div className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-1">{label}</div>
                    <ul className="text-[13px] text-gray-700 space-y-0.5 list-disc pl-4">{items.map((it: string, i: number) => <li key={i}>{it}</li>)}</ul>
                  </div>
                ) : null)}
              </div>
            )}

            {/* Editor handoff / publish */}
            {isEditor && (
              <div className="flex gap-2 items-center border-t border-border pt-4">
                <span className="text-[12px] text-gray-400">편집장 권한:</span>
                <button onClick={() => patch({ stage: 'REVISION' })} className="px-3 py-1.5 text-[12px] font-medium text-gray-600 border border-gray-200 rounded hover:bg-gray-50">수정 요청(반려)</button>
                <button onClick={() => patch({ stage: 'READY' })} className="px-3 py-1.5 text-[12px] font-medium text-green-deep border border-green-deep/30 rounded hover:bg-green-50">승인(READY)</button>
                <button onClick={publish} disabled={busy === 'publish'} className="px-4 py-1.5 text-[12px] font-bold bg-green-deep text-white rounded hover:bg-green-light disabled:opacity-60">
                  {draft.postId ? '재발행' : '발행'}
                </button>
                {draft.postId && <span className="text-[12px] text-green-deep">✓ 발행됨</span>}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
