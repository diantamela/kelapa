import { db } from '@/lib/db';
import { users, distributors, jobRates } from '@/lib/db/schema';
import bcrypt from 'bcryptjs';

async function seedDatabase() {
  console.log('Seeding database...');

  // Create default admin user
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  await db.insert(users).values([
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'staff_hr',
    },
    {
      name: 'RMP Employee',
      email: 'rmp@example.com',
      password: hashedPassword,
      role: 'pegawai_rmp',
    },
    {
      name: 'MP Employee',
      email: 'mp@example.com',
      password: hashedPassword,
      role: 'pegawai_mp',
    },
    {
      name: 'Manager',
      email: 'manager@example.com',
      password: hashedPassword,
      role: 'manajer',
    }
  ]);

  // Create sample distributors
  await db.insert(distributors).values([
    {
      name: 'PT. Mitra Kelapa Sejahtera',
      contactPerson: 'Budi Santoso',
      phone: '+6281234567890',
      address: 'Jl. Kelapa No. 1, Jakarta',
    },
    {
      name: 'CV. Sumber Kelapa Abadi',
      contactPerson: 'Siti Rahayu',
      phone: '+6281234567891',
      address: 'Jl. Sawit No. 5, Bandung',
    }
  ]);

  // Create sample job rates
  await db.insert(jobRates).values([
    {
      jobType: 'shelling',
      unit: 'kg',
      ratePerUnit: '3000',
    },
    {
      jobType: 'paring',
      unit: 'kg',
      ratePerUnit: '2000',
    },
    {
      jobType: 'shaler',
      unit: 'kg',
      ratePerUnit: '2500',
    }
  ]);

  console.log('Database seeded successfully!');
}

seedDatabase()
  .then(() => {
    console.log('Seed process completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
  });