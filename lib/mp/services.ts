'use server';

import { db } from '@/lib/db';
import { requireAuthServer } from '@/lib/auth/server-utils';

export interface ProductionInput {
  productionDate: string;
  productionType: string;
  employeeId: number;
  quantity: string;
  unit: string;
  notes?: string;
}

// Production Services
export async function getAllProductions(filters?: {
  startDate?: string;
  endDate?: string;
  employeeId?: number;
  productionType?: string;
}) {
  await requireAuthServer(['pegawai_mp', 'staff_hr', 'manajer']);

  const where: any = {};
  if (filters) {
    if (filters.startDate && filters.endDate) {
      where.productionDate = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }
    if (filters.employeeId) {
      where.employeeId = filters.employeeId;
    }
    if (filters.productionType) {
      where.productionType = filters.productionType;
    }
  }

  return await db.production.findMany({
    where,
    include: {
      employee: {
        select: { id: true, firstName: true, lastName: true, employeeCode: true },
      },
    },
    orderBy: { productionDate: 'desc' },
  });
}

export async function getProductionById(id: number) {
  await requireAuthServer(['pegawai_mp', 'staff_hr', 'manajer']);

  return await db.production.findUnique({
    where: { id },
    include: {
      employee: {
        select: { id: true, firstName: true, lastName: true, employeeCode: true, position: true, division: true },
      },
    },
  });
}

export async function createProduction(data: ProductionInput) {
  const user = await requireAuthServer(['pegawai_mp']);

  return await db.production.create({
    data: {
      productionDate: new Date(data.productionDate),
      productionType: data.productionType,
      employeeId: data.employeeId,
      quantity: parseFloat(data.quantity),
      unit: data.unit,
      notes: data.notes,
    },
  });
}

export async function updateProduction(id: number, data: Partial<ProductionInput>) {
  await requireAuthServer(['pegawai_mp']);

  return await db.production.update({
    where: { id },
    data: {
      ...data,
      productionType: data.productionType,
      quantity: data.quantity ? parseFloat(data.quantity) : undefined,
      updatedAt: new Date(),
    },
  });
}

export async function deleteProduction(id: number) {
  await requireAuthServer(['pegawai_mp']);

  return await db.production.delete({
    where: { id },
  });
}

// Job Rates Services
export async function getAllJobRates() {
  await requireAuthServer(['pegawai_mp', 'staff_hr', 'manajer']);

  return await db.jobRate.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getJobRateById(id: number) {
  await requireAuthServer(['pegawai_mp', 'staff_hr', 'manajer']);

  return await db.jobRate.findUnique({
    where: { id, isActive: true },
  });
}

// Employee Production Summary
export async function getEmployeeProductionSummary(employeeId: number, startDate: string, endDate: string) {
  await requireAuthServer(['pegawai_mp', 'staff_hr', 'manajer']);

  const results = await db.production.groupBy({
    by: ['productionType'],
    where: {
      employeeId,
      productionDate: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
    _sum: {
      quantity: true,
    },
    _count: true,
  });

  return results.map(r => ({
    productionType: r.productionType,
    totalQuantity: r._sum.quantity || 0,
    count: r._count,
  }));
}

// Estimate Salary Based on Production
export async function estimateSalaryFromProduction(employeeId: number, startDate: string, endDate: string) {
  await requireAuthServer(['pegawai_mp']); // Only allow employee to view their own

  const currentUser = await requireAuthServer();
  const employee = await db.employee.findUnique({
    where: { id: employeeId },
  });

  if (!employee || (currentUser.userId !== employee.userId && currentUser.role !== 'staff_hr')) {
    throw new Error('Unauthorized to view this employee\'s salary');
  }

  // Get total production for the period
  const totalProduction = await db.production.groupBy({
    by: ['productionType'],
    where: {
      employeeId,
      productionDate: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
    _sum: {
      quantity: true,
    },
  });

  // Calculate estimated salary based on job rates
  let estimatedSalary = 0;

  for (const prod of totalProduction) {
    const jobRate = await db.jobRate.findFirst({
      where: {
        jobType: prod.productionType,
        isActive: true,
      },
    });

    if (jobRate) {
      const amount = Number(prod._sum.quantity ?? 0) * Number(jobRate.ratePerUnit);
      estimatedSalary += amount;
    }
  }

  return {
    employeeId,
    startDate,
    endDate,
    totalProduction: totalProduction.map(p => ({
      productionType: p.productionType,
      totalQuantity: p._sum.quantity || 0,
    })),
    estimatedSalary: estimatedSalary.toFixed(2),
  };
}