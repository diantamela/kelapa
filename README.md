# Kelapa - Coconut Factory Management System

A comprehensive system for managing coconut factory operations including raw material processing, production tracking, employee attendance, and automated payroll.

## Features

- **RMP Module**: Manage raw material intake and sorting operations
- **MP Module**: Track production activities (manual, machine, shaler)
- **HR Module**: Handle employee management, attendance, and payroll
- **Manager Dashboard**: Monitor operations and generate reports
- **Role-Based Access Control**: Different access levels for employees, HR, and managers
- **Automated Payroll**: Calculate salaries based on attendance and production
- **Comprehensive Reporting**: Detailed reports for all operations
- **Variance Control**: Track differences between intake and production

## Tech Stack

- **Frontend**: Next.js 16.1.1 with App Router
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based authentication
- **UI Components**: shadcn/ui (using Radix UI and Lucide React)

## Architecture

The application follows a modular architecture with the following components:

- **Database Layer**: Prisma ORM with PostgreSQL
- **Service Layer**: Business logic in `/lib` directory
- **API Layer**: Next.js API routes in `/app/api`
- **Presentation Layer**: React components in `/app` and `/components`

## Modules

### RMP (Raw Material Processing)
- Manage distributor information
- Record coconut intake with quality grades
- Track sorting operations

### MP (Manufacturing Process)
- Record production activities (manual, machine, shaler)
- Track employee productivity
- Estimate salary based on production output

### HR (Human Resources)
- Employee management
- Attendance tracking
- Automated payroll processing
- Pay period management

### Reporting
- RMP reports (intake, sorting, distributor analysis)
- MP reports (production by type, employee, date)
- Attendance reports
- Payroll reports
- Summary reports
- Variance reports (intake vs production)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
# Update DATABASE_URL and JWT_SECRET in .env.local
```

3. Generate Prisma client:
```bash
npm run db:generate
```

4. Run database migrations:
```bash
npm run db:migrate
```

5. Seed the database with sample data:
```bash
npm run db:seed
```

6. Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token generation

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### RMP Module
- `GET /api/rmp/distributors` - Get all distributors
- `POST /api/rmp/distributors` - Create distributor
- `GET /api/rmp/distributors/[id]` - Get distributor by ID
- `PUT /api/rmp/distributors/[id]` - Update distributor
- `DELETE /api/rmp/distributors/[id]` - Delete distributor
- `GET /api/rmp/coconut-intakes` - Get coconut intakes
- `POST /api/rmp/coconut-intakes` - Create coconut intake
- `GET /api/rmp/sorting-records` - Get sorting records
- `POST /api/rmp/sorting-records` - Create sorting record

### MP Module
- `GET /api/mp/productions` - Get productions
- `POST /api/mp/productions` - Create production
- `GET /api/mp/job-rates` - Get job rates

### HR Module
- `GET /api/hr/employees` - Get employees
- `POST /api/hr/employees` - Create employee
- `GET /api/hr/attendances` - Get attendances
- `POST /api/hr/attendances` - Create attendance
- `GET /api/hr/pay-periods` - Get pay periods
- `POST /api/hr/pay-periods` - Create pay period
- `POST /api/hr/payroll/process` - Process payroll
- `POST /api/hr/payroll/finalize` - Finalize payroll

### Reporting
- `GET /api/reports/rmp` - RMP reports
- `GET /api/reports/mp` - MP reports
- `GET /api/reports/attendance` - Attendance reports
- `GET /api/reports/payroll` - Payroll reports
- `GET /api/reports/summary` - Summary reports
- `GET /api/reports/variance` - Variance reports

## Roles and Permissions

- **pegawai_rmp**: Access to RMP module only
- **pegawai_mp**: Access to MP module only
- **staff_hr**: Access to HR module and some reports
- **manajer**: Read-only access to all reports

## Database Schema

The application uses Prisma ORM with the following main models:

- `User`: User accounts and authentication
- `Distributor`: Supplier information
- `CoconutIntake`: Raw material intake records
- `SortingRecord`: Sorting operation records
- `Employee`: Employee information
- `JobRate`: Production rate information
- `Attendance`: Employee attendance records
- `Production`: Production activity records
- `PayPeriod`: Payroll period definitions
- `PayrollRecord`: Calculated payroll records
- `Report`: Generated reports

## Security

- JWT-based authentication with secure cookies
- Role-based access control for all operations
- Input validation and sanitization
- Secure password hashing with bcrypt

## Testing

Run the application test:
```bash
tsx test/application-test.ts
```

## Deployment

For production deployment, ensure you have:

1. Proper environment variables set
2. PostgreSQL database configured
3. SSL certificates for secure connections
4. Proper session management for production