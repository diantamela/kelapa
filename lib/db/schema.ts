import { pgTable, serial, text, integer, timestamp, decimal, boolean, date, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const userRoles = pgEnum('user_roles', ['pegawai_rmp', 'pegawai_mp', 'staff_hr', 'manajer']);
export const attendanceStatus = pgEnum('attendance_status', ['present', 'absent', 'late', 'early_leave']);
export const payrollStatus = pgEnum('payroll_status', ['draft', 'validated', 'final']);
export const productionType = pgEnum('production_type', ['manual', 'machine', 'shaler']);
export const qualityGrade = pgEnum('quality_grade', ['premium', 'standard', 'low']);

// Tables
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: userRoles('role').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const distributors = pgTable('distributors', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  contactPerson: text('contact_person'),
  phone: text('phone'),
  address: text('address'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const coconutIntakes = pgTable('coconut_intakes', {
  id: serial('id').primaryKey(),
  intakeDate: date('intake_date').notNull(),
  distributorId: integer('distributor_id').references(() => distributors.id),
  weight: decimal('weight', { precision: 10, scale: 2 }).notNull(), // in kg
  grade: qualityGrade('grade').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sortingRecords = pgTable('sorting_records', {
  id: serial('id').primaryKey(),
  intakeId: integer('intake_id').references(() => coconutIntakes.id),
  sortedDate: date('sorted_date').notNull(),
  goodCoconuts: decimal('good_coconuts', { precision: 10, scale: 2 }), // in kg
  badCoconuts: decimal('bad_coconuts', { precision: 10, scale: 2 }), // in kg
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const employees = pgTable('employees', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  employeeCode: text('employee_code').notNull().unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name'),
  position: text('position'),
  division: text('division'),
  employmentType: text('employment_type').notNull(), // 'daily' or 'contract'
  hourlyRate: decimal('hourly_rate', { precision: 10, scale: 2 }),
  dailyRate: decimal('daily_rate', { precision: 10, scale: 2 }),
  isActive: boolean('is_active').default(true),
  hireDate: date('hire_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const jobRates = pgTable('job_rates', {
  id: serial('id').primaryKey(),
  jobType: text('job_type').notNull(), // 'shelling', 'paring', 'shaler'
  unit: text('unit').notNull(), // 'kg', 'pieces'
  ratePerUnit: decimal('rate_per_unit', { precision: 10, scale: 2 }).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const attendances = pgTable('attendances', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').references(() => employees.id),
  date: date('date').notNull(),
  checkIn: timestamp('check_in'),
  checkOut: timestamp('check_out'),
  status: attendanceStatus('status').notNull(),
  hoursWorked: decimal('hours_worked', { precision: 4, scale: 2 }), // in hours
  mealAllowance: boolean('meal_allowance').default(false),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const productions = pgTable('productions', {
  id: serial('id').primaryKey(),
  productionDate: date('production_date').notNull(),
  productionType: productionType('production_type').notNull(),
  employeeId: integer('employee_id').references(() => employees.id),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  unit: text('unit').notNull(), // 'kg', 'pieces'
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const payPeriods = pgTable('pay_periods', {
  id: serial('id').primaryKey(),
  periodName: text('period_name').notNull(), // e.g. 'Week 1 Jan 2024'
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  status: payrollStatus('status').default('draft'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const payrollRecords = pgTable('payroll_records', {
  id: serial('id').primaryKey(),
  payPeriodId: integer('pay_period_id').references(() => payPeriods.id),
  employeeId: integer('employee_id').references(() => employees.id),
  employmentType: text('employment_type').notNull(), // 'daily' or 'contract'
  
  // Daily worker fields
  daysWorked: integer('days_worked'),
  dailyRate: decimal('daily_rate', { precision: 10, scale: 2 }),
  dailySalary: decimal('daily_salary', { precision: 10, scale: 2 }),
  
  // Contract worker fields
  totalProduction: decimal('total_production', { precision: 10, scale: 2 }),
  ratePerUnit: decimal('rate_per_unit', { precision: 10, scale: 2 }),
  contractSalary: decimal('contract_salary', { precision: 10, scale: 2 }),
  
  // Common fields
  mealAllowance: decimal('meal_allowance', { precision: 10, scale: 2 }),
  bonuses: decimal('bonuses', { precision: 10, scale: 2 }).default('0'),
  deductions: decimal('deductions', { precision: 10, scale: 2 }).default('0'),
  grossSalary: decimal('gross_salary', { precision: 10, scale: 2 }),
  netSalary: decimal('net_salary', { precision: 10, scale: 2 }),
  
  status: payrollStatus('status').notNull(),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const reports = pgTable('reports', {
  id: serial('id').primaryKey(),
  reportType: text('report_type').notNull(), // 'daily_summary', 'weekly_summary', etc.
  reportDate: date('report_date').notNull(),
  data: text('data').notNull(), // JSON string
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});