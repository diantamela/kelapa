// app/api/hr/payroll/process/route.ts
import { NextRequest } from 'next/server';
import { 
  processPayroll 
} from '@/lib/hr/services';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await processPayroll(body);
    return Response.json(result, { status: 200 });
  } catch (error) {
    console.error('Process payroll error:', error);
    return Response.json(
      { success: false, message: 'Failed to process payroll' },
      { status: 500 }
    );
  }
}