// src/app/(public)/team/page.tsx
import { prisma } from '@/lib/db';
import TeamClient from './TeamClient';

export default async function TeamPage() {
  const members = await prisma.teamMember.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: 'asc' },
  });

  return <TeamClient members={JSON.parse(JSON.stringify(members))} />;
}
