'use server';

import { db } from '@/lib/db';
import { requireAuthServer } from '@/lib/auth/server-utils';
import { AttendanceStatus, PayrollStatus } from '@prisma/client';

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
  status: AttendanceStatus; // present | absent | late | early_leave
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
  await requireAuthServer(['staff_hr', 'manajer']);
  
  return db.employee.findMany({
    select: {
      id: true,
      employeeCode: true,
      firstName: true,
      lastName: true,
      position: true,
      division: true,
      employmentType: true,
      hourlyRate: true,
      dailyRate: true,
      isActive: true,
      hireDate: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        }
      },
      createdAt: true,
    },
    where: {
      ...(filters?.employmentType && { employmentType: filters.employmentType }),
      ...(typeof filters?.isActive !== 'undefined' && { isActive: filters.isActive }),
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export async function getEmployeeById(id: number) {
  await requireAuthServer(['staff_hr', 'manajer']);
  
  return db.employee.findUnique({
    where: { id },
    select: {
      id: true,
      employeeCode: true,
      firstName: true,
      lastName: true,
      position: true,
      division: true,
      employmentType: true,
      hourlyRate: true,
      dailyRate: true,
      isActive: true,
      hireDate: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        }
      },
      createdAt: true,
      updatedAt: true,
    }
  });
}

export async function createEmployee(data: EmployeeInput) {
  await requireAuthServer(['staff_hr']);
  
  return db.employee.create({
    data: {
      ...data,
      isActive: true,
    }
  });
}

export async function updateEmployee(id: number, data: Partial<EmployeeInput>) {
  await requireAuthServer(['staff_hr']);
  
  return db.employee.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    }
  });
}

// Attendance Services
export async function getAllAttendances(filters?: {
  startDate?: string;
  endDate?: string;
  employeeId?: number;
  status?: AttendanceStatus;
}) {
  await requireAuthServer(['staff_hr', 'manajer']);
  
  return db.attendance.findMany({
    select: {
      id: true,
      date: true,
      checkIn: true,
      checkOut: true,
      status: true,
      hoursWorked: true,
      mealAllowance: true,
      notes: true,
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeCode: true,
        }
      },
      createdAt: true,
    },
    where: {
      ...(filters?.startDate && filters?.endDate && {
        date: {
          gte: filters.startDate,
          lte: filters.endDate,
        }
      }),
      ...(filters?.employeeId && { employeeId: filters.employeeId }),
      ...(filters?.status && { status: filters.status }),
    },
    orderBy: {
      date: 'desc'
    }
  });
}

export async function getAttendanceById(id: number) {
  await requireAuthServer(['staff_hr', 'manajer']);
  
  return db.attendance.findUnique({
    where: { id },
    select: {
      id: true,
      date: true,
      checkIn: true,
      checkOut: true,
      status: true,
      hoursWorked: true,
      mealAllowance: true,
      notes: true,
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeCode: true,
          position: true,
        }
      },
      createdAt: true,
      updatedAt: true,
    }
  });
}

export async function createAttendance(data: AttendanceInput) {
  await requireAuthServer(['staff_hr']);
  
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
  
  return db.attendance.create({
    data: {
      ...data,
      hoursWorked,
      mealAllowance,
    }
  });
}

export async function updateAttendance(id: number, data: Partial<AttendanceInput>) {
  await requireAuthServer(['staff_hr']);
  
  // Calculate hours worked if both checkIn and checkOut are provided
  const updateData: any = { ...data, updatedAt: new Date() };
  
  if (data.checkIn || data.checkOut) {
    const existing = await getAttendanceById(id);
    const checkIn = data.checkIn || existing?.checkIn?.toString();
    const checkOut = data.checkOut || existing?.checkOut?.toString();
    
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
  
  return db.attendance.update({
    where: { id },
    data: updateData
  });
}

// Pay Period Services
export async function getAllPayPeriods() {
  await requireAuthServer(['staff_hr', 'manajer']);
  
  return db.payPeriod.findMany({
    orderBy: {
      startDate: 'desc'
    }
  });
}

export async function getPayPeriodById(id: number) {
  await requireAuthServer(['staff_hr', 'manajer']);
  
  return db.payPeriod.findUnique({
    where: { id }
  });
}

export async function createPayPeriod(data: PayPeriodInput) {
  await requireAuthServer(['staff_hr']);
  
  return db.payPeriod.create({
    data
  });
}

export async function updatePayPeriod(id: number, data: Partial<PayPeriodInput>) {
  await requireAuthServer(['staff_hr']);
  
  return db.payPeriod.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    }
  });
}

// Payroll Processing Services
export async function processPayroll(params: ProcessPayrollParams) {
  await requireAuthServer(['staff_hr']);
  
  // Get the pay period
  const payPeriod = await getPayPeriodById(params.payPeriodId);
  if (!payPeriod) {
    throw new Error('Pay period not found');
  }
  
  // Get all active employees
  const allEmployees = await db.employee.findMany({
    where: { isActive: true },
  });
  
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
  await db.payPeriod.update({
    where: { id: params.payPeriodId },
    data: {
      status: PayrollStatus.validated,
      updatedAt: new Date()
    }
  });
  
  return { success: true, message: 'Payroll processed successfully' };
}

async function processDailyWorkerPayroll(employee: any, payPeriod: any) {
  // Get attendance records for the period
  const attendances = await db.attendance.findMany({
    where: {
      employeeId: employee.id,
      date: {
        gte: payPeriod.startDate,
        lte: payPeriod.endDate
      }
    }
  });
  
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
      totalHours += Number(att.hoursWorked);
    }
  }
  
  // Calculate salary
  const dailyRate = employee.dailyRate ? Number(employee.dailyRate) : 0;
  const dailySalary = daysWorked * dailyRate;
  
  // Calculate meal allowance (assuming fixed amount per day)
  const mealAllowanceAmount = totalMealAllowance * 25000; // 25k per day with meal allowance
  
  // Calculate gross salary
  const grossSalary = dailySalary + mealAllowanceAmount;
  
  // Calculate net salary (for now, assuming no deductions)
  const netSalary = grossSalary;
  
  // Insert payroll record
  await db.payrollRecord.create({
    data: {
      payPeriodId: payPeriod.id,
      employeeId: employee.id,
      employmentType: employee.employmentType,
      daysWorked,
      dailyRate: employee.dailyRate ?? undefined,
      dailySalary,
      mealAllowance: mealAllowanceAmount,
      grossSalary,
      netSalary,
      status: PayrollStatus.validated,
    }
  });
}

async function processContractWorkerPayroll(employee: any, payPeriod: any) {
  // Get production records for the period
  const productions = await db.production.findMany({
    where: {
      employeeId: employee.id,
      productionDate: {
        gte: payPeriod.startDate,
        lte: payPeriod.endDate
      }
    }
  });
  
  // Group by production type and sum quantities
  const productionByType: Record<string, number> = {};
  for (const prod of productions) {
    if (!productionByType[prod.productionType]) {
      productionByType[prod.productionType] = 0;
    }
    productionByType[prod.productionType] += Number(prod.quantity);
  }
  
  // Calculate salary based on job rates
  let totalProduction = 0;
  let contractSalary = 0;
  
  for (const [prodType, quantity] of Object.entries(productionByType)) {
    totalProduction += quantity;
    
    // Get job rate for this production type
    const jobRate = await db.jobRate.findFirst({
      where: {
        jobType: prodType,
        isActive: true
      }
    });
    
    if (jobRate) {
      const rate = Number(jobRate.ratePerUnit);
      contractSalary += quantity * rate;
    }
  }
  
  // Calculate gross salary (contract salary + bonuses - deductions)
  const grossSalary = contractSalary;
  
  // Calculate net salary (for now, assuming no deductions)
  const netSalary = grossSalary;
  
  // Insert payroll record
  await db.payrollRecord.create({
    data: {
      payPeriodId: payPeriod.id,
      employeeId: employee.id,
      employmentType: employee.employmentType,
      totalProduction,
      // ratePerUnit intentionally left null since varies per type
      contractSalary,
      grossSalary,
      netSalary,
      status: PayrollStatus.validated,
    }
  });
}

// Payroll Records Services
export async function getAllPayrollRecords(filters?: { payPeriodId?: number; employeeId?: number; status?: PayrollStatus }) {
  await requireAuthServer(['staff_hr', 'manajer']);
  
  return db.payrollRecord.findMany({
    select: {
      id: true,
      payPeriod: {
        select: {
          id: true,
          periodName: true,
          startDate: true,
          endDate: true,
        }
      },
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeCode: true,
          employmentType: true,
        }
      },
      employmentType: true,
      daysWorked: true,
      dailyRate: true,
      dailySalary: true,
      totalProduction: true,
      ratePerUnit: true,
      contractSalary: true,
      mealAllowance: true,
      bonuses: true,
      deductions: true,
      grossSalary: true,
      netSalary: true,
      status: true,
      processedAt: true,
      createdAt: true,
    },
    where: {
      ...(filters?.payPeriodId && { payPeriodId: filters.payPeriodId }),
      ...(filters?.employeeId && { employeeId: filters.employeeId }),
      ...(filters?.status && { status: filters.status }),
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getPayrollRecordById(id: number) {
  await requireAuthServer(['staff_hr', 'manajer']);
  
  return db.payrollRecord.findUnique({
    where: { id },
    select: {
      id: true,
      payPeriod: {
        select: {
          id: true,
          periodName: true,
          startDate: true,
          endDate: true,
          status: true,
        }
      },
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeCode: true,
          employmentType: true,
        }
      },
      employmentType: true,
      daysWorked: true,
      dailyRate: true,
      dailySalary: true,
      totalProduction: true,
      ratePerUnit: true,
      contractSalary: true,
      mealAllowance: true,
      bonuses: true,
      deductions: true,
      grossSalary: true,
      netSalary: true,
      status: true,
      processedAt: true,
      createdAt: true,
      updatedAt: true,
    }
  });
}

// Finalize Payroll
export async function finalizePayroll(payPeriodId: number) {
  await requireAuthServer(['staff_hr']);
  
  // Update pay period status to final
  await db.payPeriod.update({
    where: { id: payPeriodId },
    data: { status: PayrollStatus.final, updatedAt: new Date() }
  });
  
  // Update all payroll records in this period to final
  await db.payrollRecord.updateMany({
    where: { payPeriodId },
    data: { status: PayrollStatus.final, processedAt: new Date(), updatedAt: new Date() }
  });
  
  return { success: true, message: 'Payroll finalized successfully' };
}
