'use server';

import { db } from '@/lib/db';
import { requireAuthServer } from '@/lib/auth/server-utils';
import { QualityGrade } from '@prisma/client';

export interface DistributorInput {
  name: string;
  contactPerson?: string;
  phone?: string;
  address?: string;
}

export interface CoconutIntakeInput {
  intakeDate: string;
  distributorId: number;
  weight: string;
  grade: string;
  notes?: string;
}

export interface SortingRecordInput {
  intakeId: number;
  sortedDate: string;
  goodCoconuts?: string;
  badCoconuts?: string;
  notes?: string;
}

// Distributor Services
export async function getAllDistributors() {
  await requireAuthServer(['pegawai_rmp', 'staff_hr', 'manajer']);

  return await db.distributor.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getDistributorById(id: number) {
  await requireAuthServer(['pegawai_rmp', 'staff_hr', 'manajer']);

  return await db.distributor.findUnique({
    where: { id, isActive: true },
  });
}

export async function createDistributor(data: DistributorInput) {
  const user = await requireAuthServer(['pegawai_rmp', 'staff_hr']);

  return await db.distributor.create({
    data: {
      ...data,
      isActive: true,
    },
  });
}

export async function updateDistributor(id: number, data: Partial<DistributorInput>) {
  await requireAuthServer(['pegawai_rmp', 'staff_hr']);

  return await db.distributor.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
}

export async function deleteDistributor(id: number) {
  await requireAuthServer(['pegawai_rmp', 'staff_hr']);

  return await db.distributor.update({
    where: { id },
    data: { isActive: false, updatedAt: new Date() },
  });
}

// Coconut Intake Services
export async function getAllCoconutIntakes(filters?: { startDate?: string; endDate?: string; distributorId?: number }) {
  await requireAuthServer(['pegawai_rmp', 'staff_hr', 'manajer']);

  const where: any = {};
  if (filters) {
    if (filters.startDate && filters.endDate) {
      where.intakeDate = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }
    if (filters.distributorId) {
      where.distributorId = filters.distributorId;
    }
  }

  return await db.coconutIntake.findMany({
    where,
    include: {
      distributor: {
        select: { id: true, name: true },
      },
    },
    orderBy: { intakeDate: 'desc' },
  });
}

export async function getCoconutIntakeById(id: number) {
  await requireAuthServer(['pegawai_rmp', 'staff_hr', 'manajer']);

  return await db.coconutIntake.findUnique({
    where: { id },
    include: {
      distributor: {
        select: { id: true, name: true, contactPerson: true, phone: true },
      },
    },
  });
}

export async function createCoconutIntake(data: CoconutIntakeInput) {
  const user = await requireAuthServer(['pegawai_rmp']);

  return await db.coconutIntake.create({
    data: {
      intakeDate: new Date(data.intakeDate),
      distributorId: data.distributorId,
      weight: parseFloat(data.weight),
      grade: data.grade as unknown as QualityGrade,
      notes: data.notes,
    },
  });
}

// Sorting Record Services
export async function getAllSortingRecords(filters?: { startDate?: string; endDate?: string; intakeId?: number }) {
  await requireAuthServer(['pegawai_rmp', 'staff_hr', 'manajer']);

  const where: any = {};
  if (filters) {
    if (filters.startDate && filters.endDate) {
      where.sortedDate = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }
    if (filters.intakeId) {
      where.intakeId = filters.intakeId;
    }
  }

  return await db.sortingRecord.findMany({
    where,
    include: {
      intake: {
        select: { id: true, intakeDate: true, weight: true },
        include: {
          distributor: {
            select: { id: true, name: true },
          },
        },
      },
    },
    orderBy: { sortedDate: 'desc' },
  });
}

export async function getSortingRecordById(id: number) {
  await requireAuthServer(['pegawai_rmp', 'staff_hr', 'manajer']);

  return await db.sortingRecord.findUnique({
    where: { id },
    include: {
      intake: {
        select: { id: true, intakeDate: true, weight: true, grade: true },
        include: {
          distributor: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });
}

export async function createSortingRecord(data: SortingRecordInput) {
  const user = await requireAuthServer(['pegawai_rmp']);

  return await db.sortingRecord.create({
    data: {
      intakeId: data.intakeId,
      sortedDate: new Date(data.sortedDate),
      goodCoconuts: data.goodCoconuts ? parseFloat(data.goodCoconuts) : null,
      badCoconuts: data.badCoconuts ? parseFloat(data.badCoconuts) : null,
      notes: data.notes,
    },
  });
}