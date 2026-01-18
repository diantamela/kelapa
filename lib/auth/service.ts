'use server';

import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';
import {
  verifyPassword,
  generateToken,
  setServerAuthCookie,
  removeServerAuthCookie,
  JWTPayload,
  hashPassword
} from '@/lib/auth/utils';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: string;
}

export async function loginUser(credentials: LoginCredentials): Promise<{ success: boolean; message: string; user?: JWTPayload }> {
  try {
    // Find user by email
    const user = await db.user.findUnique({ where: { email: credentials.email } });
    
    if (!user) {
      return { success: false, message: 'Invalid email or password' };
    }

    if (!user.isActive) {
      return { success: false, message: 'Account is deactivated' };
    }

    // Verify password
    const isValidPassword = await verifyPassword(credentials.password, user.password);
    
    if (!isValidPassword) {
      return { success: false, message: 'Invalid email or password' };
    }

    // Generate token
    const tokenPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = generateToken(tokenPayload);

    // Set cookie
    setServerAuthCookie(token);

    return {
      success: true,
      message: 'Login successful',
      user: tokenPayload
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'An error occurred during login' };
  }
}

export async function registerUser(userData: RegisterData): Promise<{ success: boolean; message: string }> {
  try {
    // Check if user already exists
    const existingUser = await db.user.findUnique({ where: { email: userData.email } });
    
    if (existingUser) {
      return { success: false, message: 'Email already registered' };
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Insert new user
    await db.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role as unknown as UserRole,
      }
    });

    return { success: true, message: 'User registered successfully' };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'An error occurred during registration' };
  }
}

export async function logoutUser() {
  removeServerAuthCookie();
}