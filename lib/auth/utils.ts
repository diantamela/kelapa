import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// Server-side cookie functions
export function setServerAuthCookie(token: string) {
  // This function should only be called in server components
  // Importing next/headers dynamically to avoid client-side issues
  const { cookies } = require('next/headers');
  cookies().set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
    sameSite: 'strict',
  });
}

export function getServerAuthCookie(): string | undefined {
  // This function should only be called in server components
  const { cookies } = require('next/headers');
  return cookies().get('token')?.value;
}

export function removeServerAuthCookie() {
  // This function should only be called in server components
  const { cookies } = require('next/headers');
  cookies().delete('token');
}

// Client-side cookie functions
export function setClientAuthCookie(token: string) {
  document.cookie = `token=${token}; Path=/; HttpOnly=false; SameSite=Strict; Max-Age=${60 * 60 * 24}`;
}

export function getClientAuthCookie(): string | undefined {
  const name = 'token';
  let cookieValue = undefined;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export function removeClientAuthCookie() {
  document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}