// app/api/hr/pay-periods/route.ts
import { NextRequest } from 'next/server';
import { 
  getAllPayPeriods, 
  createPayPeriod 
} from '@/lib/hr/services';

export async function GET(request: NextRequest) {
  try {
    const payPeriods = await getAllPayPeriods();
    return Response.json({ payPeriods }, { status: 200 });
  } catch (error) {
    console.error('Get pay periods error:', error);
    return Response.json(
      { success: false, message: 'Failed to fetch pay periods' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createPayPeriod(body);
    return Response.json({ payPeriod: result }, { status: 201 });
  } catch (error) {
    console.error('Create pay period error:', error);
    return Response.json(
      { success: false, message: 'Failed to create pay period' },
      { status: 500 }
    );
  }
}