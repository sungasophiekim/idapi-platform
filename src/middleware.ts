// src/middleware.ts
// Security headers + rate limiting

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 60; // 60 requests per minute
const LOGIN_RATE_LIMIT_MAX = 5; // 5 login attempts per minute

function getRateLimitKey(req: NextRequest): string {
  return req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
}

function checkRateLimit(key: string, max: number): boolean {
  const now = Date.now();
  const entry = rateLimit.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimit.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

// Clean up stale entries periodically
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimit) {
      if (now > entry.resetAt) rateLimit.delete(key);
    }
  }, 60 * 1000);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getRateLimitKey(request);

  // Rate limit login endpoint more strictly
  if (pathname === '/api/auth/login' && request.method === 'POST') {
    if (!checkRateLimit(`login:${ip}`, LOGIN_RATE_LIMIT_MAX)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }
  }

  // Rate limit all API write operations
  if (pathname.startsWith('/api/') && ['POST', 'PUT', 'DELETE'].includes(request.method)) {
    if (!checkRateLimit(`api:${ip}`, RATE_LIMIT_MAX)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
  }

  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
