// app/api/mp/job-rates/route.ts
import { NextRequest } from 'next/server';
import { 
  getAllJobRates 
} from '@/lib/mp/services';

export async function GET(request: NextRequest) {
  try {
    const rates = await getAllJobRates();
    return Response.json({ rates }, { status: 200 });
  } catch (error) {
    console.error('Get job rates error:', error);
    return Response.json(
      { success: false, message: 'Failed to fetch job rates' },
      { status: 500 }
    );
  }
}