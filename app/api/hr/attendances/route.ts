// app/api/hr/attendances/route.ts
import { NextRequest } from 'next/server';
import { 
  getAllAttendances, 
  createAttendance 
} from '@/lib/hr/services';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');

    const filters: any = {};
    if (startDate && endDate) {
      filters.startDate = startDate;
      filters.endDate = endDate;
    }
    if (employeeId) {
      filters.employeeId = parseInt(employeeId);
    }
    if (status) {
      filters.status = status;
    }

    const attendances = await getAllAttendances(filters);
    return Response.json({ attendances }, { status: 200 });
  } catch (error) {
    console.error('Get attendances error:', error);
    return Response.json(
      { success: false, message: 'Failed to fetch attendances' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createAttendance(body);
    return Response.json({ attendance: result }, { status: 201 });
  } catch (error) {
    console.error('Create attendance error:', error);
    return Response.json(
      { success: false, message: 'Failed to create attendance' },
      { status: 500 }
    );
  }
}