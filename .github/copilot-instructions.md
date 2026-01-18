# Kelapa Coconut Factory Management System - AI Agent Instructions

## System Architecture Overview

This is a **role-based factory operations management system** for coconut processing with tight integration between raw materials (RMP), production (MP), and payroll. The system enforces data consistency through linked workflows.

### Three Core Domains
1. **RMP (Raw Material Processing)**: Coconut intake + sorting records → feeds into production planning
2. **MP (Manufacturing Process)**: Production tracking by type (manual/machine/shaler) → links to payroll calculations
3. **HR/Payroll**: Attendance + production output → automatic salary calculation (daily + contract-based)

### Key Architectural Insight
- **RMP → MP → Payroll are tightly coupled**: Changes to raw material intake affect production assumptions; changes to production affect salary calculations
- Services in `/lib/{rmp,mp,hr}` handle business logic; API routes in `/app/api` are thin wrappers
- Role-based middleware in `middleware.ts` restricts `/hr/*`, `/manajer/*`, etc. by `user.role` from JWT token
- All financial/production records include status fields (draft/processed/finalized) to prevent accidental edits

## Essential Development Workflows

### Database & Migrations
- **Initial setup**: `prisma generate` then `prisma migrate dev --name init` 
- **After schema changes**: `prisma migrate dev --name description_of_change`
- **Full reset** (dev only): `prisma migrate reset --force` then `npm run db:seed`
- **Seed sample data**: `npm run db:seed` (see `lib/db/seed.ts` for role + employee creation)
- **Schema is PostgreSQL-based** (see `prisma/schema.prisma`); uses `Float` for currency (not `Decimal`) and `DateTime` for dates

### Development Server
- Start: `npm run dev` (runs on port 3000)
- Build for production: `npm run build` then `npm run start`
- Type checking: `npm run lint`

### Common Changes Require Both Sides
- Adding a new field to `Employee` or `Production`? Update schema, migrate, then update service methods + API routes
- New role? Add to auth middleware `getRequiredRoleForPath()` + update `requireAuthServer()` in services

## Project-Specific Conventions

### Authentication & Authorization
- **JWT tokens** in HTTP-only cookies; verified by `verifyToken()` in middleware and `requireAuthServer()` in services
- **Roles** as strings in database (not TypeScript enums): `'pegawai_rmp'`, `'pegawai_mp'`, `'staff_hr'`, `'manajer'`
- All server functions marked `'use server'` and call `requireAuthServer(allowedRoles)` first; API routes do NOT revalidate auth (rely on middleware)

### Data Access Patterns
- Services in `lib/{rmp,mp,hr,reports}/services.ts` handle filtering, validation, and Prisma queries
- API routes in `app/api/` call services, catch errors, and return `{ success: boolean, message?, data? }`
- **No business logic in API routes**—all logic lives in services for reusability

### Payroll Logic Specifics (Critical)
- `PayrollRecord` has two salary paths:
  - **Daily workers** (`employmentType: 'daily'`): `daysWorked * dailyRate + mealAllowance`
  - **Contract workers** (`employmentType: 'contract'`): `totalProduction * ratePerUnit`
- Meal allowance triggered by `hoursWorked > 8` in `Attendance`
- Production totals pulled from `Production` records by date range + job type
- Finalization status prevents recalculation; check `PayPeriod.status` before accepting new payroll entries

### Component & UI Patterns
- **shadcn/ui** components (via Radix UI + Lucide icons); see `components/` for shared UI
- **Tailwind CSS** for styling; postcss v4 config in `postcss.config.mjs`
- Role-based page routing: users land on `/hr`, `/manajer`, `/pegawai-mp`, or `/pegawai-rmp` based on `user.role`

## Integration Points & Cross-Module Communication

| Module | Reads From | Writes To | Critical Table |
|--------|-----------|-----------|-----------------|
| RMP | Distributor, CoconutIntake | CoconutIntake, SortingRecord | coconut_intakes |
| MP | Employee, JobRate, CoconutIntake (summary) | Production | productions |
| HR | Employee, Attendance, Production | Attendance, PayrollRecord | payroll_records |
| Reports | All modules (read-only) | Report | reports |

**Example workflow**: Update intake date → regenerate production summary → recalculate payroll (if period not finalized)

## Key Files Reference

- **Routes & Pages**: `app/login/page.tsx`, `app/hr/page.tsx`, `app/manajer/page.tsx` (role-specific entry points)
- **Auth**: `lib/auth/service.ts` (login/register), `lib/auth/utils.ts` (token/password crypto), `middleware.ts` (role gate)
- **Database**: `prisma/schema.prisma` (schema), `lib/db/seed.ts` (initial data)
- **Business Services**: `lib/{rmp,mp,hr,reports}/services.ts`
- **API Endpoints**: `app/api/{rmp,mp,hr,reports}/` (parallel structure to services)

## Testing & Debugging Tips

- **Test data**: Run `npm run db:seed` to populate sample users (admin, pegawai_mp, etc.) and distributors
- **JWT debugging**: Check cookie `token` in browser DevTools; decode with jwt.io if needed
- **Role verification**: Middleware logs unauthorized access; check browser console + server logs
- **Production calculation**: Trace `processPayroll()` in `lib/hr/services.ts`—watch for null totalProduction (empty intake) or missing JobRate

## Codebase Structure Summary

```
app/                          # Next.js app router
├── api/                      # REST endpoints (thin wrappers → services)
│   ├── auth/                 # Login, register, token refresh
│   ├── {rmp,mp,hr}/          # Domain-specific API routes
│   └── reports/              # Report generation endpoints
├── {hr,manajer,pegawai-*}/   # Role-based page entry points
└── layout.tsx, globals.css   # Root layout & Tailwind
lib/
├── auth/                     # JWT token, password hashing, middleware
├── db/                       # Prisma client + seed script
└── {rmp,mp,hr,reports}/      # Business logic (services)
components/                   # Reusable UI components
prisma/
├── schema.prisma            # Database schema (PostgreSQL)
└── migrations/              # Prisma migration history
```

---

**Last Updated**: January 2026  
**Stack**: Next.js 16 + TypeScript + Prisma + PostgreSQL + Tailwind CSS
