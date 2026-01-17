// app/api/auth/login/route.ts
import { NextRequest } from 'next/server';
import { loginUser } from '@/lib/auth/service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const result = await loginUser({ email, password });

    if (!result.success) {
      return Response.json(
        { success: false, message: result.message },
        { status: 401 }
      );
    }

    return Response.json(result, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { success: false, message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}