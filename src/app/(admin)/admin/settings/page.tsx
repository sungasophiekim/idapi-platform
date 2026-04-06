// src/app/(admin)/admin/settings/page.tsx
'use client';

import { Icon } from '@/components/ui';

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="bg-white border border-border rounded-xl p-8">
        <div className="flex items-center gap-3 mb-4 text-green-deep">
          <Icon name="settings" size={24} />
          <h2 className="text-lg font-semibold">Site Configuration</h2>
        </div>
        <p className="text-[14px] text-gray-500 mb-6 leading-relaxed">
          Site settings, partner management, media library, and advanced configuration options will be available here.
          This page is a placeholder for Phase 2+ features.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Site Name', value: 'IDAPI', phase: '1' },
            { label: 'Default Language', value: 'Korean (KO)', phase: '1' },
            { label: 'Partners Section', value: 'Hidden', phase: '1' },
            { label: 'AI Engine', value: 'Coming in Phase 2', phase: '2' },
            { label: 'Community System', value: 'Coming in Phase 3', phase: '3' },
            { label: 'Analytics', value: 'Coming in Phase 4', phase: '4' },
          ].map(s => (
            <div key={s.label} className={`p-4 rounded-lg border ${s.phase === '1' ? 'border-border bg-white' : 'border-dashed border-gray-200 bg-gray-50/50'}`}>
              <div className="text-[12px] text-gray-400 mb-1">{s.label}</div>
              <div className="text-[14px] font-medium">{s.value}</div>
              {s.phase !== '1' && <div className="text-[11px] text-amber-500 mt-1">Phase {s.phase}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
