// app/api/reports/summary/route.ts
import { NextRequest } from 'next/server';
import { 
  getOverallSummary 
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

    const report = await getOverallSummary(startDate, endDate);
    return Response.json({ report }, { status: 200 });
  } catch (error) {
    console.error('Get summary report error:', error);
    return Response.json(
      { success: false, message: 'Failed to fetch summary report' },
      { status: 500 }
    );
  }
}