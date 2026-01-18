// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logoutUser } from '@/lib/auth/service';

export async function POST(request: NextRequest) {
  try {
    // Clear the token cookie directly in the route
    const cookieStore = await cookies();
    await cookieStore.delete('token');

    await logoutUser();

    return NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}