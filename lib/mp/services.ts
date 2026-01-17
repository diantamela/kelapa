'use server';

import { db } from '@/lib/db';
import { 
  productions, 
  employees,
  jobRates,
  users 
} from '@/lib/db/schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';

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
  await requireAuth(['pegawai_mp', 'staff_hr', 'manajer']);
  
  let query = db
    .select({
      id: productions.id,
      productionDate: productions.productionDate,
      productionType: productions.productionType,
      quantity: productions.quantity,
      unit: productions.unit,
      notes: productions.notes,
      employee: {
        id: employees.id,
        firstName: employees.firstName,
        lastName: employees.lastName,
        employeeCode: employees.employeeCode,
      },
      createdAt: productions.createdAt,
    })
    .from(productions)
    .leftJoin(employees, eq(productions.employeeId, employees.id));

  if (filters) {
    if (filters.startDate && filters.endDate) {
      query = query.where(
        and(
          gte(productions.productionDate, filters.startDate),
          lte(productions.productionDate, filters.endDate)
        )
      );
    }
    if (filters.employeeId) {
      query = query.where(eq(productions.employeeId, filters.employeeId));
    }
    if (filters.productionType) {
      query = query.where(eq(productions.productionType, filters.productionType));
    }
  }

  return await query.orderBy(desc(productions.productionDate));
}

export async function getProductionById(id: number) {
  await requireAuth(['pegawai_mp', 'staff_hr', 'manajer']);
  
  const [production] = await db
    .select({
      id: productions.id,
      productionDate: productions.productionDate,
      productionType: productions.productionType,
      quantity: productions.quantity,
      unit: productions.unit,
      notes: productions.notes,
      employee: {
        id: employees.id,
        firstName: employees.firstName,
        lastName: employees.lastName,
        employeeCode: employees.employeeCode,
        position: employees.position,
        division: employees.division,
      },
      createdAt: productions.createdAt,
      updatedAt: productions.updatedAt,
    })
    .from(productions)
    .leftJoin(employees, eq(productions.employeeId, employees.id))
    .where(eq(productions.id, id));
  
  return production;
}

export async function createProduction(data: ProductionInput) {
  const user = await requireAuth(['pegawai_mp']);
  
  const [result] = await db
    .insert(productions)
    .values({
      productionDate: data.productionDate,
      productionType: data.productionType,
      employeeId: data.employeeId,
      quantity: data.quantity,
      unit: data.unit,
      notes: data.notes,
    })
    .returning();
  
  return result;
}

export async function updateProduction(id: number, data: Partial<ProductionInput>) {
  await requireAuth(['pegawai_mp']);
  
  const [result] = await db
    .update(productions)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(productions.id, id))
    .returning();
  
  return result;
}

export async function deleteProduction(id: number) {
  await requireAuth(['pegawai_mp']);
  
  const [result] = await db
    .delete(productions)
    .where(eq(productions.id, id))
    .returning();
  
  return result;
}

// Job Rates Services
export async function getAllJobRates() {
  await requireAuth(['pegawai_mp', 'staff_hr', 'manajer']);
  
  return await db
    .select()
    .from(jobRates)
    .where(eq(jobRates.isActive, true))
    .orderBy(desc(jobRates.createdAt));
}

export async function getJobRateById(id: number) {
  await requireAuth(['pegawai_mp', 'staff_hr', 'manajer']);
  
  const [rate] = await db
    .select()
    .from(jobRates)
    .where(and(
      eq(jobRates.id, id),
      eq(jobRates.isActive, true)
    ));
  
  return rate;
}

// Employee Production Summary
export async function getEmployeeProductionSummary(employeeId: number, startDate: string, endDate: string) {
  await requireAuth(['pegawai_mp', 'staff_hr', 'manajer']);
  
  const results = await db
    .select({
      productionType: productions.productionType,
      totalQuantity: sql<number>`SUM(${productions.quantity})::numeric`,
      count: sql<number>`COUNT(*)::integer`,
    })
    .from(productions)
    .where(
      and(
        eq(productions.employeeId, employeeId),
        gte(productions.productionDate, startDate),
        lte(productions.productionDate, endDate)
      )
    )
    .groupBy(productions.productionType);
  
  return results;
}

// Estimate Salary Based on Production
export async function estimateSalaryFromProduction(employeeId: number, startDate: string, endDate: string) {
  await requireAuth(['pegawai_mp']); // Only allow employee to view their own
  
  const currentUser = await requireAuth();
  const employee = await db.query.employees.findFirst({
    where: eq(employees.id, employeeId),
  });
  
  if (!employee || (currentUser.userId !== employee.userId && currentUser.role !== 'staff_hr')) {
    throw new Error('Unauthorized to view this employee\'s salary');
  }
  
  // Get total production for the period
  const totalProduction = await db
    .select({
      productionType: productions.productionType,
      totalQuantity: sql<number>`SUM(${productions.quantity})::numeric`,
    })
    .from(productions)
    .where(
      and(
        eq(productions.employeeId, employeeId),
        gte(productions.productionDate, startDate),
        lte(productions.productionDate, endDate)
      )
    )
    .groupBy(productions.productionType);
  
  // Calculate estimated salary based on job rates
  let estimatedSalary = 0;
  
  for (const prod of totalProduction) {
    const jobRate = await db.query.jobRates.findFirst({
      where: and(
        eq(jobRates.jobType, prod.productionType),
        eq(jobRates.isActive, true)
      ),
    });
    
    if (jobRate) {
      const amount = Number(prod.totalQuantity) * Number(jobRate.ratePerUnit);
      estimatedSalary += amount;
    }
  }
  
  return {
    employeeId,
    startDate,
    endDate,
    totalProduction,
    estimatedSalary: estimatedSalary.toFixed(2),
  };
}