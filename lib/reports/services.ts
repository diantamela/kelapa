'use server';

import { db } from '@/lib/db';
import { requireAuthServer } from '@/lib/auth/server-utils';

// RMP Reports
export async function getRMPReport(startDate: string, endDate: string) {
  await requireAuthServer(['manajer']);
  
  // Total coconut intake by date
  const intakeSummaryRaw = await db.coconutIntake.groupBy({
    by: ['intakeDate'],
    where: {
      intakeDate: { gte: new Date(startDate), lte: new Date(endDate) }
    },
    _sum: { weight: true },
    _count: { _all: true },
    orderBy: { intakeDate: 'desc' },
  });
  const intakeSummary = intakeSummaryRaw.map(r => ({
    date: r.intakeDate,
    totalWeight: Number(r._sum.weight ?? 0),
    count: r._count._all,
  }));
  
  // Intake by distributor
  const intakeByDistributorAgg = await db.coconutIntake.groupBy({
    by: ['distributorId'],
    where: {
      intakeDate: { gte: new Date(startDate), lte: new Date(endDate) }
    },
    _sum: { weight: true },
    _count: { _all: true },
    orderBy: { _sum: { weight: 'desc' } },
  });
  const distributorIds = intakeByDistributorAgg.map(i => i.distributorId).filter((v): v is number => v != null);
  const distributors = distributorIds.length
    ? await db.distributor.findMany({ where: { id: { in: distributorIds } }, select: { id: true, name: true } })
    : [];
  const distributorNameMap = new Map(distributors.map(d => [d.id, d.name] as const));
  const intakeByDistributor = intakeByDistributorAgg.map(r => ({
    distributorName: r.distributorId ? (distributorNameMap.get(r.distributorId) ?? 'Unknown') : 'Unknown',
    totalWeight: Number(r._sum.weight ?? 0),
    count: r._count._all,
  }));

  // Sorting summary
  const sortingSummaryRaw = await db.sortingRecord.groupBy({
    by: ['sortedDate'],
    where: {
      sortedDate: { gte: new Date(startDate), lte: new Date(endDate) }
    },
    _sum: { goodCoconuts: true, badCoconuts: true },
    orderBy: { sortedDate: 'desc' },
  });
  const sortingSummary = sortingSummaryRaw.map(r => ({
    sortedDate: r.sortedDate,
    totalGoodCoconuts: Number(r._sum.goodCoconuts ?? 0),
    totalBadCoconuts: Number(r._sum.badCoconuts ?? 0),
  }));
  
  return { intakeSummary, intakeByDistributor, sortingSummary };
}

// MP Reports
export async function getMPReport(startDate: string, endDate: string) {
  await requireAuthServer(['manajer']);
  
  // Production by type
  const productionByTypeRaw = await db.production.groupBy({
    by: ['productionType'],
    where: {
      productionDate: { gte: new Date(startDate), lte: new Date(endDate) }
    },
    _sum: { quantity: true },
    _count: { _all: true },
    orderBy: { _sum: { quantity: 'desc' } },
  });
  const productionByType = productionByTypeRaw.map(r => ({
    productionType: r.productionType,
    totalQuantity: Number(r._sum.quantity ?? 0),
    count: r._count._all,
  }));
  
  // Production by employee
  const productionByEmployeeAgg = await db.production.groupBy({
    by: ['employeeId'],
    where: {
      productionDate: { gte: new Date(startDate), lte: new Date(endDate) }
    },
    _sum: { quantity: true },
    _count: { _all: true },
    orderBy: { _sum: { quantity: 'desc' } },
  });
  const employeeIds = productionByEmployeeAgg.map(p => p.employeeId).filter((v): v is number => v != null);
  const employees = employeeIds.length
    ? await db.employee.findMany({ where: { id: { in: employeeIds } }, select: { id: true, firstName: true, lastName: true, employeeCode: true } })
    : [];
  const empMap = new Map(employees.map(e => [e.id, e] as const));
  const productionByEmployee = productionByEmployeeAgg.map(r => ({
    employeeName: r.employeeId ? `${empMap.get(r.employeeId)?.firstName ?? ''} ${empMap.get(r.employeeId)?.lastName ?? ''}`.trim() : 'Unknown',
    employeeCode: r.employeeId ? (empMap.get(r.employeeId)?.employeeCode ?? 'Unknown') : 'Unknown',
    totalQuantity: Number(r._sum.quantity ?? 0),
    count: r._count._all,
  }));

  // Production trend by date
  const productionTrendRaw = await db.production.groupBy({
    by: ['productionDate'],
    where: {
      productionDate: { gte: new Date(startDate), lte: new Date(endDate) }
    },
    _sum: { quantity: true },
    _count: { _all: true },
    orderBy: { productionDate: 'asc' },
  });
  const productionTrend = productionTrendRaw.map(r => ({
    date: r.productionDate,
    totalQuantity: Number(r._sum.quantity ?? 0),
    count: r._count._all,
  }));
  
  return { productionByType, productionByEmployee, productionTrend };
}

// Attendance Reports
export async function getAttendanceReport(startDate: string, endDate: string) {
  await requireAuthServer(['manajer']);
  
  // Attendance summary by date
  const attendanceSummaryAgg = await db.attendance.groupBy({
    by: ['date'],
    where: { date: { gte: new Date(startDate), lte: new Date(endDate) } },
    _count: {
      _all: true,
    },
    orderBy: { date: 'asc' },
  });
  // Counts per status per day need separate queries or $queryRaw; do minimal approach:
  const statuses: Array<'present' | 'absent' | 'late'> = ['present', 'absent', 'late'];
  const perDayStatusCounts = new Map<string, { present: number; absent: number; late: number }>();
  for (const day of attendanceSummaryAgg) {
    const dayStr = day.date.toISOString().slice(0, 10);
    const counts: any = { present: 0, absent: 0, late: 0 };
    for (const s of statuses) {
      const c = await db.attendance.count({ where: { date: day.date, status: s as any } });
      counts[s] = c;
    }
    perDayStatusCounts.set(dayStr, counts);
  }
  const attendanceSummary = attendanceSummaryAgg.map(day => {
    const key = day.date.toISOString().slice(0, 10);
    const counts = perDayStatusCounts.get(key)!;
    return {
      date: day.date,
      presentCount: counts.present,
      absentCount: counts.absent,
      lateCount: counts.late,
      totalEmployees: day._count._all,
    };
  });

  // Attendance by employee over period
  const employeesInPeriod = await db.attendance.groupBy({
    by: ['employeeId'],
    where: { date: { gte: new Date(startDate), lte: new Date(endDate) } },
  });
  const empIds = employeesInPeriod.map(e => e.employeeId);
  const empInfo = empIds.length
    ? await db.employee.findMany({ where: { id: { in: empIds } }, select: { id: true, firstName: true, lastName: true, employeeCode: true } })
    : [];
  const empInfoMap = new Map(empInfo.map(e => [e.id, e] as const));
  const attendanceByEmployee = await Promise.all(empIds.map(async id => {
    const [presentDays, absentDays, lateDays, totalDays] = await Promise.all([
      db.attendance.count({ where: { employeeId: id, date: { gte: new Date(startDate), lte: new Date(endDate) }, status: 'present' as any } }),
      db.attendance.count({ where: { employeeId: id, date: { gte: new Date(startDate), lte: new Date(endDate) }, status: 'absent' as any } }),
      db.attendance.count({ where: { employeeId: id, date: { gte: new Date(startDate), lte: new Date(endDate) }, status: 'late' as any } }),
      db.attendance.count({ where: { employeeId: id, date: { gte: new Date(startDate), lte: new Date(endDate) } } }),
    ]);
    const info = empInfoMap.get(id);
    return {
      employeeName: info ? `${info.firstName} ${info.lastName ?? ''}`.trim() : 'Unknown',
      employeeCode: info?.employeeCode ?? 'Unknown',
      presentDays,
      absentDays,
      lateDays,
      totalDays,
    };
  }));

  // Average hours worked in period for present days
  const avgHoursData = await db.attendance.aggregate({
    _avg: { hoursWorked: true },
    where: { date: { gte: new Date(startDate), lte: new Date(endDate) }, status: 'present' as any },
  });
  const avgHoursWorked = Number(avgHoursData._avg.hoursWorked ?? 0);
  
  return { attendanceSummary, attendanceByEmployee, avgHoursWorked };
}

// Payroll Reports
export async function getPayrollReport(startDate: string, endDate: string) {
  await requireAuthServer(['manajer']);
  
  // Payroll summary by pay period
  const periodsInRange = await db.payPeriod.findMany({
    where: { startDate: { gte: new Date(startDate) }, endDate: { lte: new Date(endDate) } },
    select: { id: true, periodName: true, startDate: true, endDate: true },
    orderBy: { startDate: 'desc' },
  });
  const periodIds = periodsInRange.map(p => p.id);
  const perPeriodAgg = periodIds.length
    ? await db.payrollRecord.groupBy({ by: ['payPeriodId'], where: { payPeriodId: { in: periodIds } }, _sum: { grossSalary: true, netSalary: true }, _count: { _all: true } })
    : [];
  const perPeriodMap = new Map(perPeriodAgg.map(a => [a.payPeriodId, a] as const));
  const payrollSummary = periodsInRange.map(p => ({
    periodName: p.periodName,
    startDate: p.startDate,
    endDate: p.endDate,
    totalEmployeesPaid: perPeriodMap.get(p.id)?._count._all ?? 0,
    totalGrossSalary: Number(perPeriodMap.get(p.id)?._sum.grossSalary ?? 0),
    totalNetSalary: Number(perPeriodMap.get(p.id)?._sum.netSalary ?? 0),
  }));

  // Payroll by employment type (within date range)
  const recordsInRange = await db.payrollRecord.findMany({
    where: { payPeriodId: { in: periodIds } },
    select: { employmentType: true, netSalary: true },
  });
  const byTypeMap = new Map<string, { totalEmployees: number; totalSalary: number; sumForAvg: number }>();
  for (const r of recordsInRange) {
    const key = r.employmentType;
    const entry = byTypeMap.get(key) ?? { totalEmployees: 0, totalSalary: 0, sumForAvg: 0 };
    entry.totalEmployees += 1;
    entry.totalSalary += Number(r.netSalary ?? 0);
    entry.sumForAvg += Number(r.netSalary ?? 0);
    byTypeMap.set(key, entry);
  }
  const payrollByType = Array.from(byTypeMap.entries()).map(([employmentType, v]) => ({
    employmentType,
    totalEmployees: v.totalEmployees,
    totalSalary: v.totalSalary,
    avgSalary: v.totalEmployees > 0 ? v.sumForAvg / v.totalEmployees : 0,
  }));

  // Top earners in range
  const topEarnersRecords = await db.payrollRecord.findMany({
    where: { payPeriodId: { in: periodIds } },
    select: {
      netSalary: true,
      employee: { select: { firstName: true, lastName: true, employeeCode: true, employmentType: true } },
      payPeriod: { select: { periodName: true } },
    },
    orderBy: { netSalary: 'desc' },
    take: 10,
  });
  const topEarners = topEarnersRecords.map(r => ({
    employeeName: `${r.employee.firstName} ${r.employee.lastName ?? ''}`.trim(),
    employeeCode: r.employee.employeeCode,
    employmentType: r.employee.employmentType,
    netSalary: r.netSalary,
    periodName: r.payPeriod.periodName,
  }));

  return { payrollSummary, payrollByType, topEarners };
}

// Overall Summary Report
export async function getOverallSummary(startDate: string, endDate: string) {
  await requireAuthServer(['manajer']);
  
  // Totals
  const [intakeAgg, productionAgg, payrollAgg, employeeCount] = await Promise.all([
    db.coconutIntake.aggregate({ _sum: { weight: true }, where: { intakeDate: { gte: new Date(startDate), lte: new Date(endDate) } } }),
    db.production.aggregate({ _sum: { quantity: true }, where: { productionDate: { gte: new Date(startDate), lte: new Date(endDate) } } }),
    db.payrollRecord.aggregate({ _sum: { netSalary: true }, where: { createdAt: { gte: new Date(startDate), lte: new Date(endDate) } } }),
    db.employee.count(),
  ]);

  const totalMetrics = {
    totalIntake: Number(intakeAgg._sum.weight ?? 0),
    totalProduction: Number(productionAgg._sum.quantity ?? 0),
    totalPayroll: Number(payrollAgg._sum.netSalary ?? 0),
    totalEmployees: employeeCount,
  };

  const efficiencyMetrics = {
    productionEfficiency: totalMetrics.totalIntake > 0 ? (totalMetrics.totalProduction / totalMetrics.totalIntake) * 100 : 0,
    avgPayrollPerEmployee: totalMetrics.totalEmployees > 0 ? totalMetrics.totalPayroll / totalMetrics.totalEmployees : 0,
  };
  
  return { totalMetrics, efficiencyMetrics };
}

// Control Variance Report (Intake vs Production)
export async function getControlVarianceReport(startDate: string, endDate: string) {
  await requireAuthServer(['manajer']);
  
  const intakeByDate = await db.coconutIntake.groupBy({
    by: ['intakeDate'],
    where: { intakeDate: { gte: new Date(startDate), lte: new Date(endDate) } },
    _sum: { weight: true },
    orderBy: { intakeDate: 'asc' },
  });
  const productionByDate = await db.production.groupBy({
    by: ['productionDate'],
    where: { productionDate: { gte: new Date(startDate), lte: new Date(endDate) } },
    _sum: { quantity: true },
    orderBy: { productionDate: 'asc' },
  });

  const intakeMap = new Map(intakeByDate.map(i => [i.intakeDate.toISOString().slice(0,10), Number(i._sum.weight ?? 0)] as const));
  const prodMap = new Map(productionByDate.map(p => [p.productionDate.toISOString().slice(0,10), Number(p._sum.quantity ?? 0)] as const));

  const allDates = new Set<string>([...intakeMap.keys(), ...prodMap.keys()]);
  const varianceData = Array.from(allDates).sort().map(date => {
    const intake = intakeMap.get(date) ?? 0;
    const production = prodMap.get(date) ?? 0;
    const variance = intake - production;
    const variancePercentage = intake > 0 ? (variance / intake) * 100 : 0;
    return { date, intake, production, variance, variancePercentage };
  });

  const totalIntake = Array.from(intakeMap.values()).reduce((a, b) => a + b, 0);
  const totalProduction = Array.from(prodMap.values()).reduce((a, b) => a + b, 0);
  const overallVariance = totalIntake - totalProduction;
  const overallVariancePercentage = totalIntake > 0 ? (overallVariance / totalIntake) * 100 : 0;

  return { varianceData, totalIntake, totalProduction, overallVariance, overallVariancePercentage };
}
