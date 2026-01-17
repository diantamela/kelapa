// app/api/auth/logout/route.ts
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { logoutUser } from '@/lib/auth/service';

export async function POST(request: NextRequest) {
  try {
    // Clear the token cookie directly in the route
    const cookieStore = cookies();
    cookieStore.delete('token');

    await logoutUser();

    return Response.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return Response.json(
      { success: false, message: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}