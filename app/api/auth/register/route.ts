// app/api/auth/register/route.ts
import { NextRequest } from 'next/server';
import { registerUser } from '@/lib/auth/service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return Response.json(
        { success: false, message: 'Name, email, password, and role are required' },
        { status: 400 }
      );
    }

    const result = await registerUser({ name, email, password, role });

    return Response.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    console.error('Registration error:', error);
    return Response.json(
      { success: false, message: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}