// app/api/reports/payroll/route.ts
import { NextRequest } from 'next/server';
import { 
  getPayrollReport 
} from '@/lib/reports/services';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return Response.json(
        { success: false, message: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    const report = await getPayrollReport(startDate, endDate);
    return Response.json({ report }, { status: 200 });
  } catch (error) {
    console.error('Get payroll report error:', error);
    return Response.json(
      { success: false, message: 'Failed to fetch payroll report' },
      { status: 500 }
    );
  }
}