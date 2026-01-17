// app/api/mp/productions/route.ts
import { NextRequest } from 'next/server';
import { 
  getAllProductions, 
  createProduction 
} from '@/lib/mp/services';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const employeeId = searchParams.get('employeeId');
    const productionType = searchParams.get('productionType');

    const filters: any = {};
    if (startDate && endDate) {
      filters.startDate = startDate;
      filters.endDate = endDate;
    }
    if (employeeId) {
      filters.employeeId = parseInt(employeeId);
    }
    if (productionType) {
      filters.productionType = productionType;
    }

    const productions = await getAllProductions(filters);
    return Response.json({ productions }, { status: 200 });
  } catch (error) {
    console.error('Get productions error:', error);
    return Response.json(
      { success: false, message: 'Failed to fetch productions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createProduction(body);
    return Response.json({ production: result }, { status: 201 });
  } catch (error) {
    console.error('Create production error:', error);
    return Response.json(
      { success: false, message: 'Failed to create production' },
      { status: 500 }
    );
  }
}