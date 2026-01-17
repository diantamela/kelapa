// app/api/hr/employees/route.ts
import { NextRequest } from 'next/server';
import { 
  getAllEmployees, 
  createEmployee 
} from '@/lib/hr/services';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employmentType = searchParams.get('employmentType');
    const isActiveParam = searchParams.get('isActive');

    const filters: any = {};
    if (employmentType) {
      filters.employmentType = employmentType;
    }
    if (isActiveParam !== null) {
      filters.isActive = isActiveParam === 'true';
    }

    const employees = await getAllEmployees(filters);
    return Response.json({ employees }, { status: 200 });
  } catch (error) {
    console.error('Get employees error:', error);
    return Response.json(
      { success: false, message: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createEmployee(body);
    return Response.json({ employee: result }, { status: 201 });
  } catch (error) {
    console.error('Create employee error:', error);
    return Response.json(
      { success: false, message: 'Failed to create employee' },
      { status: 500 }
    );
  }
}