// src/app/api/auth/logout/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { logout } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('idapi_token')?.value;
  if (token) await logout(token);

  const response = NextResponse.json({ success: true });
  response.cookies.delete('idapi_token');
  return response;
}
