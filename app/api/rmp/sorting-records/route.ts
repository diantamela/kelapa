// app/api/rmp/sorting-records/route.ts
import { NextRequest } from 'next/server';
import { 
  getAllSortingRecords, 
  createSortingRecord 
} from '@/lib/rmp/services';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const intakeId = searchParams.get('intakeId');

    const filters: any = {};
    if (startDate && endDate) {
      filters.startDate = startDate;
      filters.endDate = endDate;
    }
    if (intakeId) {
      filters.intakeId = parseInt(intakeId);
    }

    const records = await getAllSortingRecords(filters);
    return Response.json({ records }, { status: 200 });
  } catch (error) {
    console.error('Get sorting records error:', error);
    return Response.json(
      { success: false, message: 'Failed to fetch sorting records' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createSortingRecord(body);
    return Response.json({ record: result }, { status: 201 });
  } catch (error) {
    console.error('Create sorting record error:', error);
    return Response.json(
      { success: false, message: 'Failed to create sorting record' },
      { status: 500 }
    );
  }
}