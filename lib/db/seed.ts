import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

// Gunakan file langsung untuk seeding
const prisma = new PrismaClient();

async function seed() {
  try {
    // Hapus data lama jika ada
    await prisma.payrollRecord.deleteMany({});
    await prisma.attendance.deleteMany({});
    await prisma.production.deleteMany({});
    await prisma.employee.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.coconutIntake.deleteMany({});
    await prisma.distributor.deleteMany({});
    
    console.log('Data lama dihapus');

    // Buat distributor awal
    const distributor = await prisma.distributor.create({
      data: {
        name: 'PT. Kelapa Makmur',
        contactPerson: 'Budi Santoso',
        phone: '+6281234567890',
        address: 'Jl. Kelapa No. 1, Jakarta'
      }
    });

    console.log('Distributor dibuat:', distributor.name);

    // Buat beberapa jenis pekerjaan
    const jobRates = await Promise.all([
      prisma.jobRate.create({
        data: {
          jobType: 'pengupasan',
          unit: 'kg',
          ratePerUnit: 1500
        }
      }),
      prisma.jobRate.create({
        data: {
          jobType: 'pemecahan',
          unit: 'buah',
          ratePerUnit: 500
        }
      })
    ]);

    console.log('Jenis pekerjaan dibuat:', jobRates.length);

    // Buat pengguna admin
    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin Utama',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'manajer'
      }
    });

    console.log('Admin dibuat:', adminUser.name);

    // Buat pengguna untuk Pegawai RMP
    const rmpUser = await prisma.user.create({
      data: {
        name: 'Pegawai RMP',
        email: 'rmp@example.com',
        password: hashedPassword,
        role: 'pegawai_rmp'
      }
    });

    console.log('Pegawai RMP dibuat:', rmpUser.name);

    // Buat pengguna untuk Pegawai MP
    const mpUser = await prisma.user.create({
      data: {
        name: 'Pegawai MP',
        email: 'mp@example.com',
        password: hashedPassword,
        role: 'pegawai_mp'
      }
    });

    console.log('Pegawai MP dibuat:', mpUser.name);

    // Buat pengguna untuk Staff HR
    const hrUser = await prisma.user.create({
      data: {
        name: 'Staff HR',
        email: 'hr@example.com',
        password: hashedPassword,
        role: 'hr'
      }
    });

    console.log('Staff HR dibuat:', hrUser.name);

    // Buat karyawan
    const employee = await prisma.employee.create({
      data: {
        employeeCode: 'EMP001',
        firstName: 'Ahmad',
        lastName: 'Kurniawan',
        position: 'Operator Produksi',
        division: 'Produksi',
        employmentType: 'full_time',
        hourlyRate: 10000,
        dailyRate: 80000,
        user: {
          connect: { id: adminUser.id }
        }
      }
    });

    console.log('Karyawan dibuat:', employee.firstName);

    // Buat absensi
    await prisma.attendance.create({
      data: {
        employeeId: employee.id,
        date: new Date(),
        checkIn: new Date(new Date().setHours(8, 0, 0)),
        checkOut: new Date(new Date().setHours(17, 0, 0)),
        status: 'present',
        hoursWorked: 8.0,
        mealAllowance: true
      }
    });

    console.log('Absensi dibuat');

    // Buat produksi
    await prisma.production.create({
      data: {
        productionDate: new Date(),
        productionType: 'manual',
        employeeId: employee.id,
        quantity: 50,
        unit: 'kg'
      }
    });

    console.log('Produksi dibuat');

    // Buat periode gaji
    const payPeriod = await prisma.payPeriod.create({
      data: {
        periodName: 'Januari 2026',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-01-31'),
        status: 'draft'
      }
    });

    console.log('Periode gaji dibuat:', payPeriod.periodName);

    // Buat data gaji
    await prisma.payrollRecord.create({
      data: {
        payPeriodId: payPeriod.id,
        employeeId: employee.id,
        employmentType: employee.employmentType,
        daysWorked: 22,
        dailyRate: employee.dailyRate || 0,
        dailySalary: employee.dailyRate || 0,
        totalProduction: 1100,
        ratePerUnit: 1500,
        contractSalary: employee.dailyRate ? employee.dailyRate * 22 : 0,
        mealAllowance: 55000,
        bonuses: 100000,
        deductions: 0,
        grossSalary: (employee.dailyRate ? employee.dailyRate * 22 : 0) + 100000,
        netSalary: (employee.dailyRate ? employee.dailyRate * 22 : 0) + 100000 + 55000,
        status: 'draft'
      }
    });

    console.log('Data gaji dibuat');

    // Buat penerimaan kelapa
    await prisma.coconutIntake.create({
      data: {
        intakeDate: new Date(),
        distributorId: distributor.id,
        weight: 1000,
        grade: 'premium',
        notes: 'Pengiriman awal bulan'
      }
    });

    console.log('Penerimaan kelapa dibuat');

    console.log('\nSeeder selesai! Data awal telah dimasukkan ke database.');
  } catch (error) {
    console.error('Error saat seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();