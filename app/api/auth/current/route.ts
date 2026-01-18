import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, JWTPayload } from '@/lib/auth/utils';

export async function GET(request: NextRequest) {
  try {
    // Get the token from cookies
    const cookieStore = await cookies();
    const tokenCookie = await cookieStore.get('token');
    const token = tokenCookie?.value;

    if (!token) {
      return Response.json({ user: null }, { status: 200 });
    }

    const user = verifyToken(token);
    
    return Response.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Get current user error:', error);
    return Response.json({ user: null }, { status: 200 });
  }
}