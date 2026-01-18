'use client';

// Client-side authentication utilities
export async function requireAuthClient(allowedRoles?: string[]): Promise<any> {
  try {
    const response = await fetch('/api/auth/current');
    const { user } = await response.json();

    if (!user) {
      // Redirect to login
      window.location.href = '/login';
      return null;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to unauthorized
      window.location.href = '/unauthorized';
      return null;
    }

    return user;
  } catch (error) {
    console.error('Authentication error:', error);
    window.location.href = '/login';
    return null;
  }
}

export async function getCurrentUserClient(): Promise<any> {
  try {
    const response = await fetch('/api/auth/current');
    const { user } = await response.json();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function checkAuthClient(): Promise<{ isAuthenticated: boolean; user: any }> {
  try {
    const response = await fetch('/api/auth/current');
    const { user } = await response.json();
    return {
      isAuthenticated: !!user,
      user,
    };
  } catch (error) {
    console.error('Error checking auth:', error);
    return {
      isAuthenticated: false,
      user: null,
    };
  }
}