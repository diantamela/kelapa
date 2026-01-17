'use server';

import { db } from '@/lib/db';
import { 
  employees, 
  attendances,
  payPeriods,
  payrollRecords,
  users,
  productions,
  jobRates
} from '@/lib/db/schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';

export interface EmployeeInput {
  employeeCode: string;
  firstName: string;
  lastName?: string;
  position?: string;
  division?: string;
  employmentType: string; // 'daily' or 'contract'
  hourlyRate?: string;
  dailyRate?: string;
  hireDate?: string;
}

export interface AttendanceInput {
  employeeId: number;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: string; // 'present', 'absent', 'late', 'early_leave'
  notes?: string;
}

export interface PayPeriodInput {
  periodName: string;
  startDate: string;
  endDate: string;
}

export interface ProcessPayrollParams {
  payPeriodId: number;
}

// Employee Services
export async function getAllEmployees(filters?: { employmentType?: string; isActive?: boolean }) {
  await requireAuth(['staff_hr', 'manajer']);
  
  let query = db
    .select({
      id: employees.id,
      employeeCode: employees.employeeCode,
      firstName: employees.firstName,
      lastName: employees.lastName,
      position: employees.position,
      division: employees.division,
      employmentType: employees.employmentType,
      hourlyRate: employees.hourlyRate,
      dailyRate: employees.dailyRate,
      isActive: employees.isActive,
      hireDate: employees.hireDate,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      },
      createdAt: employees.createdAt,
    })
    .from(employees)
    .leftJoin(users, eq(employees.userId, users.id));

  if (filters) {
    if (filters.employmentType) {
      query = query.where(eq(employees.employmentType, filters.employmentType));
    }
    if (typeof filters.isActive !== 'undefined') {
      query = query.where(eq(employees.isActive, filters.isActive));
    }
  }

  return await query.orderBy(desc(employees.createdAt));
}

export async function getEmployeeById(id: number) {
  await requireAuth(['staff_hr', 'manajer']);
  
  const [employee] = await db
    .select({
      id: employees.id,
      employeeCode: employees.employeeCode,
      firstName: employees.firstName,
      lastName: employees.lastName,
      position: employees.position,
      division: employees.division,
      employmentType: employees.employmentType,
      hourlyRate: employees.hourlyRate,
      dailyRate: employees.dailyRate,
      isActive: employees.isActive,
      hireDate: employees.hireDate,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      },
      createdAt: employees.createdAt,
      updatedAt: employees.updatedAt,
    })
    .from(employees)
    .leftJoin(users, eq(employees.userId, users.id))
    .where(eq(employees.id, id));
  
  return employee;
}

export async function createEmployee(data: EmployeeInput) {
  const user = await requireAuth(['staff_hr']);
  
  const [result] = await db
    .insert(employees)
    .values({
      ...data,
      isActive: true,
    })
    .returning();
  
  return result;
}

export async function updateEmployee(id: number, data: Partial<EmployeeInput>) {
  await requireAuth(['staff_hr']);
  
  const [result] = await db
    .update(employees)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(employees.id, id))
    .returning();
  
  return result;
}

// Attendance Services
export async function getAllAttendances(filters?: { 
  startDate?: string; 
  endDate?: string; 
  employeeId?: number;
  status?: string;
}) {
  await requireAuth(['staff_hr', 'manajer']);
  
  let query = db
    .select({
      id: attendances.id,
      date: attendances.date,
      checkIn: attendances.checkIn,
      checkOut: attendances.checkOut,
      status: attendances.status,
      hoursWorked: attendances.hoursWorked,
      mealAllowance: attendances.mealAllowance,
      notes: attendances.notes,
      employee: {
        id: employees.id,
        firstName: employees.firstName,
        lastName: employees.lastName,
        employeeCode: employees.employeeCode,
      },
      createdAt: attendances.createdAt,
    })
    .from(attendances)
    .leftJoin(employees, eq(attendances.employeeId, employees.id));

  if (filters) {
    if (filters.startDate && filters.endDate) {
      query = query.where(
        and(
          gte(attendances.date, filters.startDate),
          lte(attendances.date, filters.endDate)
        )
      );
    }
    if (filters.employeeId) {
      query = query.where(eq(attendances.employeeId, filters.employeeId));
    }
    if (filters.status) {
      query = query.where(eq(attendances.status, filters.status));
    }
  }

  return await query.orderBy(desc(attendances.date));
}

export async function getAttendanceById(id: number) {
  await requireAuth(['staff_hr', 'manajer']);
  
  const [attendance] = await db
    .select({
      id: attendances.id,
      date: attendances.date,
      checkIn: attendances.checkIn,
      checkOut: attendances.checkOut,
      status: attendances.status,
      hoursWorked: attendances.hoursWorked,
      mealAllowance: attendances.mealAllowance,
      notes: attendances.notes,
      employee: {
        id: employees.id,
        firstName: employees.firstName,
        lastName: employees.lastName,
        employeeCode: employees.employeeCode,
        position: employees.position,
      },
      createdAt: attendances.createdAt,
      updatedAt: attendances.updatedAt,
    })
    .from(attendances)
    .leftJoin(employees, eq(attendances.employeeId, employees.id))
    .where(eq(attendances.id, id));
  
  return attendance;
}

export async function createAttendance(data: AttendanceInput) {
  const user = await requireAuth(['staff_hr']);
  
  // Calculate hours worked if both checkIn and checkOut are provided
  let hoursWorked: string | undefined;
  let mealAllowance = false;
  
  if (data.checkIn && data.checkOut) {
    const checkInTime = new Date(data.checkIn);
    const checkOutTime = new Date(data.checkOut);
    const diffMs = checkOutTime.getTime() - checkInTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    hoursWorked = diffHours.toFixed(2);
    
    // Set meal allowance if worked more than 8 hours
    if (diffHours > 8) {
      mealAllowance = true;
    }
  }
  
  const [result] = await db
    .insert(attendances)
    .values({
      ...data,
      hoursWorked,
      mealAllowance,
    })
    .returning();
  
  return result;
}

export async function updateAttendance(id: number, data: Partial<AttendanceInput>) {
  await requireAuth(['staff_hr']);
  
  // Calculate hours worked if both checkIn and checkOut are provided
  const updateData: any = { ...data, updatedAt: new Date() };
  
  if (data.checkIn || data.checkOut) {
    const existing = await getAttendanceById(id);
    const checkIn = data.checkIn || existing?.checkIn;
    const checkOut = data.checkOut || existing?.checkOut;
    
    if (checkIn && checkOut) {
      const checkInTime = new Date(checkIn);
      const checkOutTime = new Date(checkOut);
      const diffMs = checkOutTime.getTime() - checkInTime.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      updateData.hoursWorked = diffHours.toFixed(2);
      
      // Set meal allowance if worked more than 8 hours
      updateData.mealAllowance = diffHours > 8;
    }
  }
  
  const [result] = await db
    .update(attendances)
    .set(updateData)
    .where(eq(attendances.id, id))
    .returning();
  
  return result;
}

// Pay Period Services
export async function getAllPayPeriods() {
  await requireAuth(['staff_hr', 'manajer']);
  
  return await db
    .select()
    .from(payPeriods)
    .orderBy(desc(payPeriods.startDate));
}

export async function getPayPeriodById(id: number) {
  await requireAuth(['staff_hr', 'manajer']);
  
  const [payPeriod] = await db
    .select()
    .from(payPeriods)
    .where(eq(payPeriods.id, id));
  
  return payPeriod;
}

export async function createPayPeriod(data: PayPeriodInput) {
  const user = await requireAuth(['staff_hr']);
  
  const [result] = await db
    .insert(payPeriods)
    .values(data)
    .returning();
  
  return result;
}

export async function updatePayPeriod(id: number, data: Partial<PayPeriodInput>) {
  await requireAuth(['staff_hr']);
  
  const [result] = await db
    .update(payPeriods)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(payPeriods.id, id))
    .returning();
  
  return result;
}

// Payroll Processing Services
export async function processPayroll(params: ProcessPayrollParams) {
  const user = await requireAuth(['staff_hr']);
  
  // Get the pay period
  const payPeriod = await getPayPeriodById(params.payPeriodId);
  if (!payPeriod) {
    throw new Error('Pay period not found');
  }
  
  // Get all active employees
  const allEmployees = await db
    .select()
    .from(employees)
    .where(eq(employees.isActive, true));
  
  // Process payroll for each employee
  for (const employee of allEmployees) {
    if (employee.employmentType === 'daily') {
      // Process daily worker payroll
      await processDailyWorkerPayroll(employee, payPeriod);
    } else if (employee.employmentType === 'contract') {
      // Process contract worker payroll
      await processContractWorkerPayroll(employee, payPeriod);
    }
  }
  
  // Update pay period status to validated
  await db
    .update(payPeriods)
    .set({ status: 'validated', updatedAt: new Date() })
    .where(eq(payPeriods.id, params.payPeriodId));
  
  return { success: true, message: 'Payroll processed successfully' };
}

async function processDailyWorkerPayroll(employee: typeof employees.$inferSelect, payPeriod: typeof payPeriods.$inferSelect) {
  // Get attendance records for the period
  const attendances = await db
    .select()
    .from(attendances)
    .where(
      and(
        eq(attendances.employeeId, employee.id),
        gte(attendances.date, payPeriod.startDate),
        lte(attendances.date, payPeriod.endDate)
      )
    );
  
  // Calculate days worked and total hours
  let daysWorked = 0;
  let totalMealAllowance = 0;
  let totalHours = 0;
  
  for (const att of attendances) {
    if (att.status === 'present') {
      daysWorked++;
    }
    
    if (att.mealAllowance) {
      totalMealAllowance += 1; // Count days with meal allowance
    }
    
    if (att.hoursWorked) {
      totalHours += parseFloat(att.hoursWorked);
    }
  }
  
  // Calculate salary
  const dailyRate = employee.dailyRate ? parseFloat(employee.dailyRate) : 0;
  const dailySalary = daysWorked * dailyRate;
  
  // Calculate meal allowance (assuming fixed amount per day)
  const mealAllowanceAmount = totalMealAllowance * 25000; // 25k per day with meal allowance
  
  // Calculate gross salary
  const grossSalary = dailySalary + mealAllowanceAmount;
  
  // Calculate net salary (for now, assuming no deductions)
  const netSalary = grossSalary;
  
  // Insert payroll record
  await db
    .insert(payrollRecords)
    .values({
      payPeriodId: payPeriod.id,
      employeeId: employee.id,
      employmentType: employee.employmentType,
      daysWorked,
      dailyRate: employee.dailyRate,
      dailySalary: dailySalary.toString(),
      mealAllowance: mealAllowanceAmount.toString(),
      grossSalary: grossSalary.toString(),
      netSalary: netSalary.toString(),
      status: 'validated',
    });
}

async function processContractWorkerPayroll(employee: typeof employees.$inferSelect, payPeriod: typeof payPeriods.$inferSelect) {
  // Get production records for the period
  const productions = await db
    .select()
    .from(productions)
    .where(
      and(
        eq(productions.employeeId, employee.id),
        gte(productions.productionDate, payPeriod.startDate),
        lte(productions.productionDate, payPeriod.endDate)
      )
    );
  
  // Group by production type and sum quantities
  const productionByType: Record<string, number> = {};
  for (const prod of productions) {
    if (!productionByType[prod.productionType]) {
      productionByType[prod.productionType] = 0;
    }
    productionByType[prod.productionType] += parseFloat(prod.quantity);
  }
  
  // Calculate salary based on job rates
  let totalProduction = 0;
  let contractSalary = 0;
  
  for (const [prodType, quantity] of Object.entries(productionByType)) {
    totalProduction += quantity;
    
    // Get job rate for this production type
    const jobRate = await db
      .select()
      .from(jobRates)
      .where(
        and(
          eq(jobRates.jobType, prodType),
          eq(jobRates.isActive, true)
        )
      )
      .limit(1);
    
    if (jobRate.length > 0) {
      const rate = parseFloat(jobRate[0].ratePerUnit);
      contractSalary += quantity * rate;
    }
  }
  
  // Calculate gross salary (contract salary + bonuses - deductions)
  const grossSalary = contractSalary;
  
  // Calculate net salary (for now, assuming no deductions)
  const netSalary = grossSalary;
  
  // Insert payroll record
  await db
    .insert(payrollRecords)
    .values({
      payPeriodId: payPeriod.id,
      employeeId: employee.id,
      employmentType: employee.employmentType,
      totalProduction: totalProduction.toString(),
      ratePerUnit: '', // Will be calculated per production type
      contractSalary: contractSalary.toString(),
      grossSalary: grossSalary.toString(),
      netSalary: netSalary.toString(),
      status: 'validated',
    });
}

// Payroll Records Services
export async function getAllPayrollRecords(filters?: { payPeriodId?: number; employeeId?: number; status?: string }) {
  await requireAuth(['staff_hr', 'manajer']);
  
  let query = db
    .select({
      id: payrollRecords.id,
      payPeriod: {
        id: payPeriods.id,
        periodName: payPeriods.periodName,
        startDate: payPeriods.startDate,
        endDate: payPeriods.endDate,
      },
      employee: {
        id: employees.id,
        firstName: employees.firstName,
        lastName: employees.lastName,
        employeeCode: employees.employeeCode,
        employmentType: employees.employmentType,
      },
      employmentType: payrollRecords.employmentType,
      daysWorked: payrollRecords.daysWorked,
      dailyRate: payrollRecords.dailyRate,
      dailySalary: payrollRecords.dailySalary,
      totalProduction: payrollRecords.totalProduction,
      ratePerUnit: payrollRecords.ratePerUnit,
      contractSalary: payrollRecords.contractSalary,
      mealAllowance: payrollRecords.mealAllowance,
      bonuses: payrollRecords.bonuses,
      deductions: payrollRecords.deductions,
      grossSalary: payrollRecords.grossSalary,
      netSalary: payrollRecords.netSalary,
      status: payrollRecords.status,
      processedAt: payrollRecords.processedAt,
      createdAt: payrollRecords.createdAt,
    })
    .from(payrollRecords)
    .leftJoin(payPeriods, eq(payrollRecords.payPeriodId, payPeriods.id))
    .leftJoin(employees, eq(payrollRecords.employeeId, employees.id));

  if (filters) {
    if (filters.payPeriodId) {
      query = query.where(eq(payrollRecords.payPeriodId, filters.payPeriodId));
    }
    if (filters.employeeId) {
      query = query.where(eq(payrollRecords.employeeId, filters.employeeId));
    }
    if (filters.status) {
      query = query.where(eq(payrollRecords.status, filters.status));
    }
  }

  return await query.orderBy(desc(payrollRecords.createdAt));
}

export async function getPayrollRecordById(id: number) {
  await requireAuth(['staff_hr', 'manajer']);
  
  const [payrollRecord] = await db
    .select({
      id: payrollRecords.id,
      payPeriod: {
        id: payPeriods.id,
        periodName: payPeriods.periodName,
        startDate: payPeriods.startDate,
        endDate: payPeriods.endDate,
        status: payPeriods.status,
      },
      employee: {
        id: employees.id,
        firstName: employees.firstName,
        lastName: employees.lastName,
        employeeCode: employees.employeeCode,
        employmentType: employees.employmentType,
      },
      employmentType: payrollRecords.employmentType,
      daysWorked: payrollRecords.daysWorked,
      dailyRate: payrollRecords.dailyRate,
      dailySalary: payrollRecords.dailySalary,
      totalProduction: payrollRecords.totalProduction,
      ratePerUnit: payrollRecords.ratePerUnit,
      contractSalary: payrollRecords.contractSalary,
      mealAllowance: payrollRecords.mealAllowance,
      bonuses: payrollRecords.bonuses,
      deductions: payrollRecords.deductions,
      grossSalary: payrollRecords.grossSalary,
      netSalary: payrollRecords.netSalary,
      status: payrollRecords.status,
      processedAt: payrollRecords.processedAt,
      createdAt: payrollRecords.createdAt,
      updatedAt: payrollRecords.updatedAt,
    })
    .from(payrollRecords)
    .leftJoin(payPeriods, eq(payrollRecords.payPeriodId, payPeriods.id))
    .leftJoin(employees, eq(payrollRecords.employeeId, employees.id))
    .where(eq(payrollRecords.id, id));
  
  return payrollRecord;
}

// Finalize Payroll
export async function finalizePayroll(payPeriodId: number) {
  const user = await requireAuth(['staff_hr']);
  
  // Update pay period status to final
  await db
    .update(payPeriods)
    .set({ status: 'final', updatedAt: new Date() })
    .where(eq(payPeriods.id, payPeriodId));
  
  // Update all payroll records in this period to final
  await db
    .update(payrollRecords)
    .set({ status: 'final', processedAt: new Date(), updatedAt: new Date() })
    .where(eq(payrollRecords.payPeriodId, payPeriodId));
  
  return { success: true, message: 'Payroll finalized successfully' };
}