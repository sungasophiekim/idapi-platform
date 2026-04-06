// src/lib/supabase.ts
// Supabase client for Auth + Storage (DB handled by Prisma)

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser client (public pages, auth flows)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server client (API routes — uses service role for admin ops)
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
