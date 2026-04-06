import { prisma } from '@/lib/db';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://idapi-platform.vercel.app';

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/research`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/team`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${baseUrl}/dashboard`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
  ];

  try {
    const posts = await prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    });

    const postPages = posts.map((post) => ({
      url: `${baseUrl}/research/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    const members = await prisma.teamMember.findMany({
      where: { isPublished: true },
      select: { id: true, updatedAt: true },
    });

    const memberPages = members.map((m) => ({
      url: `${baseUrl}/team/${m.id}`,
      lastModified: m.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));

    return [...staticPages, ...postPages, ...memberPages];
  } catch {
    return staticPages;
  }
}
