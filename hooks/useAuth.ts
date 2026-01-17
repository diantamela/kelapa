'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Client-side hook for authentication
export function useAuth(allowedRoles?: string[]) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get token from document.cookie
        const token = getCookie('token');
        
        if (!token) {
          router.push('/login');
          return;
        }

        // Verify token by calling API
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!data.valid || !data.user) {
          router.push('/login');
          return;
        }

        if (allowedRoles && !allowedRoles.includes(data.user.role)) {
          router.push('/unauthorized');
          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, allowedRoles]);

  return { user, loading };
}

// Helper function to get cookie by name
function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
}

// Client-side function to get current user info
export async function getCurrentUserClient(): Promise<any> {
  try {
    const token = getCookie('token');
    
    if (!token) {
      return null;
    }

    const response = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (data.valid && data.user) {
      return data.user;
    }

    return null;
  } catch (error) {
    console.error('Error getting current user client-side:', error);
    return null;
  }
}