import { cookies } from 'next/headers';
import { verifyToken, JWTPayload } from '@/lib/auth/utils';
import { redirect } from 'next/navigation';

// Server-side function to get user from cookies
export async function getCurrentUser(): Promise<JWTPayload | null> {
  try {
    // In some Next.js environments, cookies() might not be available
    // So we'll try to get it safely
    let token: string | undefined;

    try {
      const cookieStore = cookies();
      const cookie = cookieStore.get('token');
      token = cookie?.value;
    } catch (cookieError) {
      console.warn('Could not access cookies:', cookieError);
      // Try to get token from request headers if available in a different context
      // This is a fallback and might not work in all cases
      return null;
    }

    if (!token) {
      return null;
    }

    return verifyToken(token);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Server-side function that handles authentication and redirects
export async function requireAuth(allowedRoles?: string[]): Promise<JWTPayload> {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    redirect('/unauthorized');
  }

  return user;
}

// Server-side function to check auth without redirecting
export async function checkAuth(): Promise<{ isAuthenticated: boolean; user: JWTPayload | null }> {
  const user = await getCurrentUser();
  return {
    isAuthenticated: !!user,
    user,
  };
}