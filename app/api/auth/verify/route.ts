// app/api/auth/verify/route.ts
import { NextRequest } from 'next/server';
import { verifyToken, JWTPayload } from '@/lib/auth/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return Response.json(
        { valid: false, message: 'Token is required' },
        { status: 400 }
      );
    }

    const user = verifyToken(token);

    if (!user) {
      return Response.json(
        { valid: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    return Response.json(
      { valid: true, user, message: 'Token is valid' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Token verification error:', error);
    return Response.json(
      { valid: false, message: 'An error occurred during token verification' },
      { status: 500 }
    );
  }
}