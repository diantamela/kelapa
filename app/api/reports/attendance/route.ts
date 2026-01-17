// app/api/reports/attendance/route.ts
import { NextRequest } from 'next/server';
import { 
  getAttendanceReport 
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

    const report = await getAttendanceReport(startDate, endDate);
    return Response.json({ report }, { status: 200 });
  } catch (error) {
    console.error('Get attendance report error:', error);
    return Response.json(
      { success: false, message: 'Failed to fetch attendance report' },
      { status: 500 }
    );
  }
}