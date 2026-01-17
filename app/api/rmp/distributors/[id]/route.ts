// app/api/rmp/distributors/[id]/route.ts
import { NextRequest } from 'next/server';
import { 
  getDistributorById, 
  updateDistributor, 
  deleteDistributor 
} from '@/lib/rmp/services';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return Response.json(
        { success: false, message: 'Invalid distributor ID' },
        { status: 400 }
      );
    }

    const distributor = await getDistributorById(id);
    if (!distributor) {
      return Response.json(
        { success: false, message: 'Distributor not found' },
        { status: 404 }
      );
    }

    return Response.json({ distributor }, { status: 200 });
  } catch (error) {
    console.error('Get distributor error:', error);
    return Response.json(
      { success: false, message: 'Failed to fetch distributor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return Response.json(
        { success: false, message: 'Invalid distributor ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const result = await updateDistributor(id, body);

    return Response.json({ distributor: result }, { status: 200 });
  } catch (error) {
    console.error('Update distributor error:', error);
    return Response.json(
      { success: false, message: 'Failed to update distributor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return Response.json(
        { success: false, message: 'Invalid distributor ID' },
        { status: 400 }
      );
    }

    const result = await deleteDistributor(id);

    return Response.json({ distributor: result }, { status: 200 });
  } catch (error) {
    console.error('Delete distributor error:', error);
    return Response.json(
      { success: false, message: 'Failed to delete distributor' },
      { status: 500 }
    );
  }
}