// src/app/(admin)/admin/DashClient.tsx
'use client';

import { Badge, Icon } from '@/components/ui';

const CATEGORIES: Record<string, string> = {
  COMMENTARY: 'Commentary', POLICY_BRIEF: 'Policy Brief',
  PRESS_RELEASE: 'Press', SEMINAR: 'Seminar', REPORT: 'Report',
};

export default function AdminDashClient({ stats, recentPosts }: {
  stats: { postCount: number; publishedCount: number; teamCount: number; totalViews: number };
  recentPosts: any[];
}) {
  const cards = [
    { label: 'Total Posts', value: stats.postCount, color: 'text-green-deep' },
    { label: 'Published', value: stats.publishedCount, color: 'text-blue-600' },
    { label: 'Team Members', value: stats.teamCount, color: 'text-amber-600' },
    { label: 'Total Views', value: stats.totalViews, color: 'text-purple-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className="bg-white border border-border rounded-xl p-5">
            <div className="text-[12px] text-gray-400 mb-1">{c.label}</div>
            <div className={`text-[28px] font-bold ${c.color}`}>{c.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <h2 className="text-[16px] font-bold mb-3">Recent posts</h2>
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        {recentPosts.map((p: any, i: number) => (
          <div key={p.id} className={`flex items-center gap-3 px-5 py-3.5 ${i < recentPosts.length - 1 ? 'border-b border-gray-100' : ''}`}>
            <Badge color={p.status === 'PUBLISHED' ? 'green' : 'amber'}>{p.status}</Badge>
            <Badge>{CATEGORIES[p.category] || p.category}</Badge>
            <div className="flex-1 text-[14px] font-medium truncate">{p.title}</div>
            <div className="text-[12px] text-gray-400 hidden sm:block">{p.teamAuthor?.name}</div>
            <div className="text-[12px] text-gray-400">{p.publishedAt?.slice(0, 10)}</div>
            <div className="text-[12px] text-gray-300 flex items-center gap-1"><Icon name="eye" size={13} />{p.viewCount}</div>
          </div>
        ))}
        {recentPosts.length === 0 && <div className="py-10 text-center text-gray-400">No posts yet</div>}
      </div>
    </div>
  );
}
