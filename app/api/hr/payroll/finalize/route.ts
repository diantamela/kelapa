// app/api/hr/payroll/finalize/route.ts
import { NextRequest } from 'next/server';
import { 
  finalizePayroll 
} from '@/lib/hr/services';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payPeriodId } = body;
    
    if (!payPeriodId) {
      return Response.json(
        { success: false, message: 'Pay period ID is required' },
        { status: 400 }
      );
    }
    
    const result = await finalizePayroll(payPeriodId);
    return Response.json(result, { status: 200 });
  } catch (error) {
    console.error('Finalize payroll error:', error);
    return Response.json(
      { success: false, message: 'Failed to finalize payroll' },
      { status: 500 }
    );
  }
}