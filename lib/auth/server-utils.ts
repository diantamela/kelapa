import { cookies } from 'next/headers';
import { verifyToken, JWTPayload } from './utils';

// Server-side function to get user from cookies
export async function getCurrentUserServer(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const tokenCookie = await cookieStore.get('token');
    const token = tokenCookie?.value;

    if (!token) {
      return null;
    }

    return verifyToken(token);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Server-side function that handles authentication
export async function requireAuthServer(allowedRoles?: string[]): Promise<JWTPayload> {
  const user = await getCurrentUserServer();

  if (!user) {
    // In API routes, throw an error that can be caught
    throw new Error('Unauthorized: No user authenticated');
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // In API routes, throw an error that can be caught
    throw new Error('Forbidden: Insufficient permissions');
  }

  return user;
}

// Server-side function to check auth without throwing errors
export async function checkAuthServer(): Promise<{ isAuthenticated: boolean; user: JWTPayload | null }> {
  const user = await getCurrentUserServer();
  return {
    isAuthenticated: !!user,
    user,
  };
}