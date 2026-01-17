'use server';

import { db } from '@/lib/db';
import { 
  coconutIntakes,
  sortingRecords,
  productions,
  attendances,
  payrollRecords,
  payPeriods,
  distributors,
  employees
} from '@/lib/db/schema';
import { eq, and, gte, lte, desc, sql, count, avg, sum } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';

// RMP Reports
export async function getRMPReport(startDate: string, endDate: string) {
  await requireAuth(['manajer']);
  
  // Total coconut intake by date
  const intakeSummary = await db
    .select({
      date: coconutIntakes.intakeDate,
      totalWeight: sql<number>`SUM(${coconutIntakes.weight})::numeric`,
      count: count(coconutIntakes.id).mapWith(Number),
    })
    .from(coconutIntakes)
    .where(
      and(
        gte(coconutIntakes.intakeDate, startDate),
        lte(coconutIntakes.intakeDate, endDate)
      )
    )
    .groupBy(coconutIntakes.intakeDate)
    .orderBy(desc(coconutIntakes.intakeDate));
  
  // Intake by distributor
  const intakeByDistributor = await db
    .select({
      distributorName: distributors.name,
      totalWeight: sql<number>`SUM(${coconutIntakes.weight})::numeric`,
      count: count(coconutIntakes.id).mapWith(Number),
    })
    .from(coconutIntakes)
    .leftJoin(distributors, eq(coconutIntakes.distributorId, distributors.id))
    .where(
      and(
        gte(coconutIntakes.intakeDate, startDate),
        lte(coconutIntakes.intakeDate, endDate)
      )
    )
    .groupBy(distributors.name)
    .orderBy(desc(sql<number>`SUM(${coconutIntakes.weight})::numeric`));
  
  // Sorting summary
  const sortingSummary = await db
    .select({
      sortedDate: sortingRecords.sortedDate,
      totalGoodCoconuts: sql<number>`SUM(${sortingRecords.goodCoconuts})::numeric`,
      totalBadCoconuts: sql<number>`SUM(${sortingRecords.badCoconuts})::numeric`,
    })
    .from(sortingRecords)
    .where(
      and(
        gte(sortingRecords.sortedDate, startDate),
        lte(sortingRecords.sortedDate, endDate)
      )
    )
    .groupBy(sortingRecords.sortedDate)
    .orderBy(desc(sortingRecords.sortedDate));
  
  return {
    intakeSummary,
    intakeByDistributor,
    sortingSummary,
  };
}

// MP Reports
export async function getMPReport(startDate: string, endDate: string) {
  await requireAuth(['manajer']);
  
  // Production by type
  const productionByType = await db
    .select({
      productionType: productions.productionType,
      totalQuantity: sql<number>`SUM(${productions.quantity})::numeric`,
      count: count(productions.id).mapWith(Number),
    })
    .from(productions)
    .where(
      and(
        gte(productions.productionDate, startDate),
        lte(productions.productionDate, endDate)
      )
    )
    .groupBy(productions.productionType)
    .orderBy(desc(sql<number>`SUM(${productions.quantity})::numeric`));
  
  // Production by employee
  const productionByEmployee = await db
    .select({
      employeeName: sql<string>`CONCAT(${employees.firstName}, ' ', ${employees.lastName})`,
      employeeCode: employees.employeeCode,
      totalQuantity: sql<number>`SUM(${productions.quantity})::numeric`,
      count: count(productions.id).mapWith(Number),
    })
    .from(productions)
    .leftJoin(employees, eq(productions.employeeId, employees.id))
    .where(
      and(
        gte(productions.productionDate, startDate),
        lte(productions.productionDate, endDate)
      )
    )
    .groupBy(employees.firstName, employees.lastName, employees.employeeCode)
    .orderBy(desc(sql<number>`SUM(${productions.quantity})::numeric`));
  
  // Production trend by date
  const productionTrend = await db
    .select({
      date: productions.productionDate,
      totalQuantity: sql<number>`SUM(${productions.quantity})::numeric`,
      count: count(productions.id).mapWith(Number),
    })
    .from(productions)
    .where(
      and(
        gte(productions.productionDate, startDate),
        lte(productions.productionDate, endDate)
      )
    )
    .groupBy(productions.productionDate)
    .orderBy(productions.productionDate);
  
  return {
    productionByType,
    productionByEmployee,
    productionTrend,
  };
}

// Attendance Reports
export async function getAttendanceReport(startDate: string, endDate: string) {
  await requireAuth(['manajer']);
  
  // Attendance summary by date
  const attendanceSummary = await db
    .select({
      date: attendances.date,
      presentCount: count(attendances.id).filter(eq(attendances.status, 'present')).mapWith(Number),
      absentCount: count(attendances.id).filter(eq(attendances.status, 'absent')).mapWith(Number),
      lateCount: count(attendances.id).filter(eq(attendances.status, 'late')).mapWith(Number),
      totalEmployees: count(attendances.id).mapWith(Number),
    })
    .from(attendances)
    .where(
      and(
        gte(attendances.date, startDate),
        lte(attendances.date, endDate)
      )
    )
    .groupBy(attendances.date)
    .orderBy(attendances.date);
  
  // Attendance by employee
  const attendanceByEmployee = await db
    .select({
      employeeName: sql<string>`CONCAT(${employees.firstName}, ' ', ${employees.lastName})`,
      employeeCode: employees.employeeCode,
      presentDays: count(attendances.id).filter(eq(attendances.status, 'present')).mapWith(Number),
      absentDays: count(attendances.id).filter(eq(attendances.status, 'absent')).mapWith(Number),
      lateDays: count(attendances.id).filter(eq(attendances.status, 'late')).mapWith(Number),
      totalDays: count(attendances.id).mapWith(Number),
    })
    .from(attendances)
    .leftJoin(employees, eq(attendances.employeeId, employees.id))
    .where(
      and(
        gte(attendances.date, startDate),
        lte(attendances.date, endDate)
      )
    )
    .groupBy(employees.firstName, employees.lastName, employees.employeeCode)
    .orderBy(desc(count(attendances.id).filter(eq(attendances.status, 'present')).mapWith(Number)));
  
  // Average hours worked
  const avgHoursWorked = await db
    .select({
      avgHours: avg(sql<number>`CAST(${attendances.hoursWorked} AS numeric)`).mapWith(Number),
    })
    .from(attendances)
    .where(
      and(
        gte(attendances.date, startDate),
        lte(attendances.date, endDate),
        eq(attendances.status, 'present')
      )
    );
  
  return {
    attendanceSummary,
    attendanceByEmployee,
    avgHoursWorked: avgHoursWorked[0]?.avgHours || 0,
  };
}

// Payroll Reports
export async function getPayrollReport(startDate: string, endDate: string) {
  await requireAuth(['manajer']);
  
  // Payroll summary by pay period
  const payrollSummary = await db
    .select({
      periodName: payPeriods.periodName,
      startDate: payPeriods.startDate,
      endDate: payPeriods.endDate,
      totalEmployeesPaid: count(payrollRecords.id).mapWith(Number),
      totalGrossSalary: sql<number>`SUM(${payrollRecords.grossSalary})::numeric`,
      totalNetSalary: sql<number>`SUM(${payrollRecords.netSalary})::numeric`,
    })
    .from(payrollRecords)
    .leftJoin(payPeriods, eq(payrollRecords.payPeriodId, payPeriods.id))
    .where(
      and(
        gte(payPeriods.startDate, startDate),
        lte(payPeriods.endDate, endDate)
      )
    )
    .groupBy(payPeriods.id)
    .orderBy(desc(payPeriods.startDate));
  
  // Payroll by employment type
  const payrollByType = await db
    .select({
      employmentType: payrollRecords.employmentType,
      totalEmployees: count(payrollRecords.id).mapWith(Number),
      totalSalary: sql<number>`SUM(${payrollRecords.netSalary})::numeric`,
      avgSalary: avg(sql<number>`CAST(${payrollRecords.netSalary} AS numeric)`).mapWith(Number),
    })
    .from(payrollRecords)
    .leftJoin(payPeriods, eq(payrollRecords.payPeriodId, payPeriods.id))
    .where(
      and(
        gte(payPeriods.startDate, startDate),
        lte(payPeriods.endDate, endDate)
      )
    )
    .groupBy(payrollRecords.employmentType)
    .orderBy(payrollRecords.employmentType);
  
  // Top earners
  const topEarners = await db
    .select({
      employeeName: sql<string>`CONCAT(${employees.firstName}, ' ', ${employees.lastName})`,
      employeeCode: employees.employeeCode,
      employmentType: employees.employmentType,
      netSalary: payrollRecords.netSalary,
      periodName: payPeriods.periodName,
    })
    .from(payrollRecords)
    .leftJoin(employees, eq(payrollRecords.employeeId, employees.id))
    .leftJoin(payPeriods, eq(payrollRecords.payPeriodId, payPeriods.id))
    .where(
      and(
        gte(payPeriods.startDate, startDate),
        lte(payPeriods.endDate, endDate)
      )
    )
    .orderBy(desc(sql<number>`CAST(${payrollRecords.netSalary} AS numeric)`))
    .limit(10);
  
  return {
    payrollSummary,
    payrollByType,
    topEarners,
  };
}

// Overall Summary Report
export async function getOverallSummary(startDate: string, endDate: string) {
  await requireAuth(['manajer']);
  
  // Total metrics
  const totalMetrics = await db
    .select({
      totalIntake: sql<number>`COALESCE(SUM(${coconutIntakes.weight}), '0')::numeric`,
      totalProduction: sql<number>`COALESCE(SUM(${productions.quantity}), '0')::numeric`,
      totalPayroll: sql<number>`COALESCE(SUM(${payrollRecords.netSalary}), '0')::numeric`,
      totalEmployees: count(employees.id).mapWith(Number),
    })
    .from(employees)
    .fullJoin(coconutIntakes, gte(coconutIntakes.intakeDate, startDate))
    .fullJoin(productions, gte(productions.productionDate, startDate))
    .fullJoin(payrollRecords, sql`${payrollRecords.createdAt} >= ${sql.placeholder('startDate')}`)
    .where(
      and(
        gte(coconutIntakes.intakeDate, startDate),
        lte(coconutIntakes.intakeDate, endDate),
        gte(productions.productionDate, startDate),
        lte(productions.productionDate, endDate)
      )
    );
  
  // Calculate efficiency metrics
  const efficiencyMetrics = {
    // Calculate ratio of production to intake
    productionEfficiency: totalMetrics[0]?.totalIntake && parseFloat(totalMetrics[0].totalIntake.toString()) > 0 
      ? (parseFloat(totalMetrics[0].totalProduction?.toString() || '0') / parseFloat(totalMetrics[0].totalIntake.toString())) * 100 
      : 0,
    avgPayrollPerEmployee: totalMetrics[0]?.totalEmployees && totalMetrics[0].totalEmployees > 0
      ? parseFloat(totalMetrics[0].totalPayroll?.toString() || '0') / totalMetrics[0].totalEmployees
      : 0,
  };
  
  return {
    totalMetrics: totalMetrics[0],
    efficiencyMetrics,
  };
}

// Control Variance Report (Intake vs Production)
export async function getControlVarianceReport(startDate: string, endDate: string) {
  await requireAuth(['manajer']);
  
  // Get total intake and production for the period
  const intakeData = await db
    .select({
      date: coconutIntakes.intakeDate,
      totalWeight: sql<number>`SUM(${coconutIntakes.weight})::numeric`,
    })
    .from(coconutIntakes)
    .where(
      and(
        gte(coconutIntakes.intakeDate, startDate),
        lte(coconutIntakes.intakeDate, endDate)
      )
    )
    .groupBy(coconutIntakes.intakeDate)
    .orderBy(coconutIntakes.intakeDate);
  
  const productionData = await db
    .select({
      date: productions.productionDate,
      totalQuantity: sql<number>`SUM(${productions.quantity})::numeric`,
    })
    .from(productions)
    .where(
      and(
        gte(productions.productionDate, startDate),
        lte(productions.productionDate, endDate)
      )
    )
    .groupBy(productions.productionDate)
    .orderBy(productions.productionDate);
  
  // Calculate variance by date
  const varianceData = [];
  
  // Create maps for easier lookup
  const intakeMap = new Map();
  intakeData.forEach(item => {
    intakeMap.set(item.date, parseFloat(item.totalWeight.toString()));
  });
  
  const productionMap = new Map();
  productionData.forEach(item => {
    productionMap.set(item.date, parseFloat(item.totalQuantity.toString()));
  });
  
  // Get unique dates
  const allDates = new Set([
    ...intakeData.map(i => i.date),
    ...productionData.map(p => p.date)
  ]);
  
  for (const date of Array.from(allDates).sort()) {
    const intakeValue = intakeMap.get(date) || 0;
    const productionValue = productionMap.get(date) || 0;
    const variance = intakeValue - productionValue;
    const variancePercentage = intakeValue > 0 ? (variance / intakeValue) * 100 : 0;
    
    varianceData.push({
      date,
      intake: intakeValue,
      production: productionValue,
      variance,
      variancePercentage,
    });
  }
  
  // Calculate overall variance
  const totalIntake = intakeData.reduce((sum, item) => sum + parseFloat(item.totalWeight.toString()), 0);
  const totalProduction = productionData.reduce((sum, item) => sum + parseFloat(item.totalQuantity.toString()), 0);
  const overallVariance = totalIntake - totalProduction;
  const overallVariancePercentage = totalIntake > 0 ? (overallVariance / totalIntake) * 100 : 0;
  
  return {
    varianceData,
    totalIntake,
    totalProduction,
    overallVariance,
    overallVariancePercentage,
  };
}