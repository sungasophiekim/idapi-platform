import { prisma } from '../lib/db';
import ClientApp from './ClientApp';

export default async function Home() {
  let posts: unknown[] = [];
  let team: unknown[] = [];

  try {
    const [postsData, teamData] = await Promise.all([
      prisma.post.findMany({
        where: { status: 'PUBLISHED' },
        select: {
          id: true, title: true, titleEn: true, excerpt: true, excerptEn: true,
          category: true, researchArea: true, publishedAt: true, views: true,
          author: { select: { name: true, nameEn: true } },
        },
        orderBy: { publishedAt: 'desc' },
      }),
      prisma.teamMember.findMany({
        where: { published: true },
        orderBy: { order: 'asc' },
        select: {
          id: true, name: true, nameEn: true, title: true, titleEn: true,
          bio: true, bioEn: true, credentials: true, credentialsEn: true, type: true,
        },
      }),
    ]);
    posts = postsData;
    team = teamData;
  } catch {
    // DB not connected yet — render with empty data
  }

  return <ClientApp initialPosts={JSON.parse(JSON.stringify(posts))} initialTeam={JSON.parse(JSON.stringify(team))} />;
}
