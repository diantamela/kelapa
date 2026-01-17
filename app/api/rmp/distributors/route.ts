// app/api/rmp/distributors/route.ts
import { NextRequest } from 'next/server';
import { 
  getAllDistributors, 
  getDistributorById, 
  createDistributor, 
  updateDistributor, 
  deleteDistributor 
} from '@/lib/rmp/services';

export async function GET(request: NextRequest) {
  try {
    const distributors = await getAllDistributors();
    return Response.json({ distributors }, { status: 200 });
  } catch (error) {
    console.error('Get distributors error:', error);
    return Response.json(
      { success: false, message: 'Failed to fetch distributors' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createDistributor(body);
    return Response.json({ distributor: result }, { status: 201 });
  } catch (error) {
    console.error('Create distributor error:', error);
    return Response.json(
      { success: false, message: 'Failed to create distributor' },
      { status: 500 }
    );
  }
}