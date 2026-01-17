// app/api/rmp/coconut-intakes/route.ts
import { NextRequest } from 'next/server';
import { 
  getAllCoconutIntakes, 
  createCoconutIntake 
} from '@/lib/rmp/services';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const distributorId = searchParams.get('distributorId');

    const filters: any = {};
    if (startDate && endDate) {
      filters.startDate = startDate;
      filters.endDate = endDate;
    }
    if (distributorId) {
      filters.distributorId = parseInt(distributorId);
    }

    const intakes = await getAllCoconutIntakes(filters);
    return Response.json({ intakes }, { status: 200 });
  } catch (error) {
    console.error('Get coconut intakes error:', error);
    return Response.json(
      { success: false, message: 'Failed to fetch coconut intakes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createCoconutIntake(body);
    return Response.json({ intake: result }, { status: 201 });
  } catch (error) {
    console.error('Create coconut intake error:', error);
    return Response.json(
      { success: false, message: 'Failed to create coconut intake' },
      { status: 500 }
    );
  }
}