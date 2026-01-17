CREATE TYPE "public"."attendance_status" AS ENUM('present', 'absent', 'late', 'early_leave');--> statement-breakpoint
CREATE TYPE "public"."payroll_status" AS ENUM('draft', 'validated', 'final');--> statement-breakpoint
CREATE TYPE "public"."production_type" AS ENUM('manual', 'machine', 'shaler');--> statement-breakpoint
CREATE TYPE "public"."quality_grade" AS ENUM('premium', 'standard', 'low');--> statement-breakpoint
CREATE TYPE "public"."user_roles" AS ENUM('pegawai_rmp', 'pegawai_mp', 'staff_hr', 'manajer');--> statement-breakpoint
CREATE TABLE "attendances" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer,
	"date" date NOT NULL,
	"check_in" timestamp,
	"check_out" timestamp,
	"status" "attendance_status" NOT NULL,
	"hours_worked" numeric(4, 2),
	"meal_allowance" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coconut_intakes" (
	"id" serial PRIMARY KEY NOT NULL,
	"intake_date" date NOT NULL,
	"distributor_id" integer,
	"weight" numeric(10, 2) NOT NULL,
	"grade" "quality_grade" NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "distributors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"contact_person" text,
	"phone" text,
	"address" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"employee_code" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text,
	"position" text,
	"division" text,
	"employment_type" text NOT NULL,
	"hourly_rate" numeric(10, 2),
	"daily_rate" numeric(10, 2),
	"is_active" boolean DEFAULT true,
	"hire_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "employees_employee_code_unique" UNIQUE("employee_code")
);
--> statement-breakpoint
CREATE TABLE "job_rates" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_type" text NOT NULL,
	"unit" text NOT NULL,
	"rate_per_unit" numeric(10, 2) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pay_periods" (
	"id" serial PRIMARY KEY NOT NULL,
	"period_name" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" "payroll_status" DEFAULT 'draft',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payroll_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"pay_period_id" integer,
	"employee_id" integer,
	"employment_type" text NOT NULL,
	"days_worked" integer,
	"daily_rate" numeric(10, 2),
	"daily_salary" numeric(10, 2),
	"total_production" numeric(10, 2),
	"rate_per_unit" numeric(10, 2),
	"contract_salary" numeric(10, 2),
	"meal_allowance" numeric(10, 2),
	"bonuses" numeric(10, 2) DEFAULT '0',
	"deductions" numeric(10, 2) DEFAULT '0',
	"gross_salary" numeric(10, 2),
	"net_salary" numeric(10, 2),
	"status" "payroll_status" NOT NULL,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "productions" (
	"id" serial PRIMARY KEY NOT NULL,
	"production_date" date NOT NULL,
	"production_type" "production_type" NOT NULL,
	"employee_id" integer,
	"quantity" numeric(10, 2) NOT NULL,
	"unit" text NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_type" text NOT NULL,
	"report_date" date NOT NULL,
	"data" text NOT NULL,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sorting_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"intake_id" integer,
	"sorted_date" date NOT NULL,
	"good_coconuts" numeric(10, 2),
	"bad_coconuts" numeric(10, 2),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" "user_roles" NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coconut_intakes" ADD CONSTRAINT "coconut_intakes_distributor_id_distributors_id_fk" FOREIGN KEY ("distributor_id") REFERENCES "public"."distributors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_records" ADD CONSTRAINT "payroll_records_pay_period_id_pay_periods_id_fk" FOREIGN KEY ("pay_period_id") REFERENCES "public"."pay_periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_records" ADD CONSTRAINT "payroll_records_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "productions" ADD CONSTRAINT "productions_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sorting_records" ADD CONSTRAINT "sorting_records_intake_id_coconut_intakes_id_fk" FOREIGN KEY ("intake_id") REFERENCES "public"."coconut_intakes"("id") ON DELETE no action ON UPDATE no action;