// src/app/api/admin/upload/route.ts
// Admin-guarded image upload → Supabase Storage (public "media" bucket).

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, requireRole } from '@/lib/auth';
import { supabase, createServerClient } from '@/lib/supabase';
import { UserRole } from '@prisma/client';

// Prefer the service-role client (bypasses storage RLS → only this
// admin-guarded route can write) when the key is configured; otherwise fall
// back to the anon client so uploads keep working.
function storageClient() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ? createServerClient() : supabase;
}

export const runtime = 'nodejs';

const MAX = 8 * 1024 * 1024; // 8MB
const OK_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!requireRole(user, [UserRole.ADMIN, UserRole.EDITOR, UserRole.RESEARCHER])) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
  if (!OK_TYPES.includes(file.type)) return NextResponse.json({ error: '이미지 파일만 가능합니다 (jpg/png/webp/gif/avif).' }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: '8MB 이하만 업로드할 수 있습니다.' }, { status: 400 });

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `posts/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const sb = storageClient();
  const { error } = await sb.storage.from('media').upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = sb.storage.from('media').getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
