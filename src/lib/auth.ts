// src/lib/auth.ts
// Authentication utilities — JWT session management

import { prisma } from './db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { UserRole } from '@prisma/client';

const JWT_SECRET: string = process.env.JWT_SECRET || (() => {
  console.error('FATAL: JWT_SECRET environment variable is not set');
  return 'MISSING-JWT-SECRET-SET-ENV-VAR';
})();
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  nameEn: string | null;
  role: UserRole;
  avatarUrl: string | null;
}

export async function login(email: string, password: string): Promise<{ user: AuthUser; token: string } | { error: string }> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) return { error: 'Invalid credentials' };

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return { error: 'Invalid credentials' };

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + SESSION_DURATION),
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return {
    user: { id: user.id, email: user.email, name: user.name, nameEn: user.nameEn, role: user.role, avatarUrl: user.avatarUrl },
    token,
  };
}

export async function getAuthUser(token?: string): Promise<AuthUser | null> {
  try {
    const t = token || (await cookies()).get('idapi_token')?.value;
    if (!t) return null;

    const decoded = jwt.verify(t, JWT_SECRET) as { userId: string };
    const session = await prisma.session.findUnique({ where: { token: t } });
    if (!session || session.expiresAt < new Date()) return null;

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || !user.isActive) return null;

    return { id: user.id, email: user.email, name: user.name, nameEn: user.nameEn, role: user.role, avatarUrl: user.avatarUrl };
  } catch {
    return null;
  }
}

export async function logout(token: string) {
  await prisma.session.deleteMany({ where: { token } });
}

export function requireRole(user: AuthUser | null, roles: UserRole[]): boolean {
  return !!user && roles.includes(user.role);
}
