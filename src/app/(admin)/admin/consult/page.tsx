'use client';

import { useState, useEffect } from 'react';
import { Badge, Icon, Btn } from '@/components/ui';

interface LawEntry {
  jurisdiction: string;
  lawName: string;
  lawNameEn: string;
  enacted: string;
  appliesToBusinessTypes: string[];
  requirements: { category: string; requirement: string; requirementEn: string; isMandatory: boolean }[];
  penalties: string;
  penaltiesEn: string;
}

interface ConsultLog {
  key: string;
  value: string;
}

const JURISDICTION_LABELS: Record<string, string> = {
  KR: '🇰🇷 Korea', US: '🇺🇸 United States', EU: '🇪🇺 EU', SG: '🇸🇬 Singapore',
  JP: '🇯🇵 Japan', UK: '🇬🇧 UK', HK: '🇭🇰 Hong Kong', INTL: '🌐 International',
};

const CATEGORY_COLORS: Record<string, string> = {
  license: 'red', registration: 'blue', reporting: 'amber', operational: 'green',
  'consumer-protection': 'green', aml: 'red', capital: 'amber', disclosure: 'blue',
};

export default function AdminConsultPage() {
  const [tab, setTab] = useState<'overview' | 'laws' | 'logs'>('overview');
  const [laws, setLaws] = useState<LawEntry[]>([]);
  const [logs, setLogs] = useState<ConsultLog[]>([]);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('all');
  const [expandedLaw, setExpandedLaw] = useState<string | null>(null);

  useEffect(() => {
    // Load law matrix from module (client-side import)
    import('@/modules/reg-consulting/law-matrix').then(mod => {
      setLaws(mod.CURRENT_LAWS as unknown as LawEntry[]);
    });
  }, []);

  const filteredLaws = selectedJurisdiction === 'all'
    ? laws
    : laws.filter(l => l.jurisdiction === selectedJurisdiction);

  // Stats
  const jurisdictions = [...new Set(laws.map(l => l.jurisdiction))];
  const totalRequirements = laws.reduce((sum, l) => sum + l.requirements.length, 0);
  const mandatoryCount = laws.reduce((sum, l) => sum + l.requirements.filter(r => r.isMandatory).length, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Regulatory Consulting</h1>
      <p className="text-sm text-gray-400 mb-6">법률 매트릭스 관리 및 컨설팅 활동 모니터링</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'overview' as const, label: 'Overview' },
          { key: 'laws' as const, label: 'Law Matrix' },
          { key: 'logs' as const, label: 'Activity Log' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t.key ? 'bg-green-deep text-white' : 'bg-white border border-border text-gray-500 hover:bg-gray-50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-border rounded-xl p-5">
              <div className="text-xs text-gray-400 mb-1">Jurisdictions</div>
              <div className="text-2xl font-bold text-green-deep">{jurisdictions.length}</div>
            </div>
            <div className="bg-white border border-border rounded-xl p-5">
              <div className="text-xs text-gray-400 mb-1">Laws Tracked</div>
              <div className="text-2xl font-bold text-blue-600">{laws.length}</div>
            </div>
            <div className="bg-white border border-border rounded-xl p-5">
              <div className="text-xs text-gray-400 mb-1">Total Requirements</div>
              <div className="text-2xl font-bold text-amber-600">{totalRequirements}</div>
            </div>
            <div className="bg-white border border-border rounded-xl p-5">
              <div className="text-xs text-gray-400 mb-1">Mandatory</div>
              <div className="text-2xl font-bold text-red-600">{mandatoryCount}</div>
            </div>
          </div>

          <h2 className="text-base font-bold mb-3">Coverage by Jurisdiction</h2>
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            {jurisdictions.map((j, i) => {
              const jLaws = laws.filter(l => l.jurisdiction === j);
              const jReqs = jLaws.reduce((s, l) => s + l.requirements.length, 0);
              return (
                <div key={j} className={`flex items-center gap-4 px-5 py-3.5 ${i < jurisdictions.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div className="text-sm font-medium w-40">{JURISDICTION_LABELS[j] || j}</div>
                  <Badge color="blue">{jLaws.length} laws</Badge>
                  <Badge color="amber">{jReqs} requirements</Badge>
                  <div className="flex-1" />
                  <div className="text-xs text-gray-400">{jLaws.map(l => l.lawNameEn).join(', ')}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Law Matrix Tab */}
      {tab === 'laws' && (
        <div>
          <div className="flex gap-2 mb-4 flex-wrap">
            <button onClick={() => setSelectedJurisdiction('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${selectedJurisdiction === 'all' ? 'bg-green-deep text-white border-green-deep' : 'border-border text-gray-500'}`}>
              All
            </button>
            {jurisdictions.map(j => (
              <button key={j} onClick={() => setSelectedJurisdiction(j)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${selectedJurisdiction === j ? 'bg-green-deep text-white border-green-deep' : 'border-border text-gray-500'}`}>
                {JURISDICTION_LABELS[j] || j}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredLaws.map(law => (
              <div key={law.lawNameEn} className="bg-white border border-border rounded-xl overflow-hidden">
                <button onClick={() => setExpandedLaw(expandedLaw === law.lawNameEn ? null : law.lawNameEn)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition"
                  aria-expanded={expandedLaw === law.lawNameEn}>
                  <Badge color="blue">{law.jurisdiction}</Badge>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{law.lawName}</div>
                    <div className="text-xs text-gray-400">{law.lawNameEn} · Enacted: {law.enacted}</div>
                  </div>
                  <Badge color="amber">{law.requirements.length} req</Badge>
                  <Icon name={expandedLaw === law.lawNameEn ? 'x' : 'arrow'} size={14} />
                </button>

                {expandedLaw === law.lawNameEn && (
                  <div className="border-t border-border px-5 py-4 bg-gray-50/50">
                    <div className="mb-3">
                      <span className="text-xs font-semibold text-gray-500">Applies to: </span>
                      <span className="text-xs text-gray-600">{law.appliesToBusinessTypes.join(', ')}</span>
                    </div>

                    <div className="space-y-2 mb-4">
                      {law.requirements.map((r, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <Badge color={CATEGORY_COLORS[r.category] || 'gray'}>{r.category}</Badge>
                          <div className="flex-1">
                            <div className="text-gray-700">{r.requirement}</div>
                            <div className="text-gray-400 text-xs mt-0.5">{r.requirementEn}</div>
                          </div>
                          {r.isMandatory && <span className="text-red-500 text-xs font-bold">필수</span>}
                        </div>
                      ))}
                    </div>

                    <div className="text-xs text-red-600 bg-red-50 rounded-lg p-3">
                      <span className="font-bold">벌칙: </span>{law.penalties}
                      <div className="text-gray-500 mt-1">{law.penaltiesEn}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Log Tab */}
      {tab === 'logs' && (
        <div>
          <div className="bg-white border border-border rounded-xl p-8 text-center text-gray-400">
            <Icon name="file" size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">컨설팅 요청 로그는 알림 시스템을 통해 기록됩니다.</p>
            <p className="text-xs mt-1">Consultation requests are logged via the notification system.</p>
          </div>
        </div>
      )}
    </div>
  );
}
