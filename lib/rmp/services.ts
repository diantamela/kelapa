'use server';

import { db } from '@/lib/db';
import { 
  distributors, 
  coconutIntakes, 
  sortingRecords,
  users 
} from '@/lib/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';

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
  await requireAuth(['pegawai_rmp', 'staff_hr', 'manajer']);
  
  return await db
    .select()
    .from(distributors)
    .where(eq(distributors.isActive, true))
    .orderBy(desc(distributors.createdAt));
}

export async function getDistributorById(id: number) {
  await requireAuth(['pegawai_rmp', 'staff_hr', 'manajer']);
  
  const [distributor] = await db
    .select()
    .from(distributors)
    .where(and(
      eq(distributors.id, id),
      eq(distributors.isActive, true)
    ));
  
  return distributor;
}

export async function createDistributor(data: DistributorInput) {
  const user = await requireAuth(['pegawai_rmp', 'staff_hr']);
  
  const [result] = await db
    .insert(distributors)
    .values({
      ...data,
      isActive: true,
    })
    .returning();
  
  return result;
}

export async function updateDistributor(id: number, data: Partial<DistributorInput>) {
  await requireAuth(['pegawai_rmp', 'staff_hr']);
  
  const [result] = await db
    .update(distributors)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(distributors.id, id))
    .returning();
  
  return result;
}

export async function deleteDistributor(id: number) {
  await requireAuth(['pegawai_rmp', 'staff_hr']);
  
  const [result] = await db
    .update(distributors)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(distributors.id, id))
    .returning();
  
  return result;
}

// Coconut Intake Services
export async function getAllCoconutIntakes(filters?: { startDate?: string; endDate?: string; distributorId?: number }) {
  await requireAuth(['pegawai_rmp', 'staff_hr', 'manajer']);
  
  let query = db
    .select({
      id: coconutIntakes.id,
      intakeDate: coconutIntakes.intakeDate,
      weight: coconutIntakes.weight,
      grade: coconutIntakes.grade,
      notes: coconutIntakes.notes,
      distributor: {
        id: distributors.id,
        name: distributors.name,
      },
      createdAt: coconutIntakes.createdAt,
    })
    .from(coconutIntakes)
    .leftJoin(distributors, eq(coconutIntakes.distributorId, distributors.id));

  if (filters) {
    if (filters.startDate && filters.endDate) {
      query = query.where(
        and(
          gte(coconutIntakes.intakeDate, filters.startDate),
          lte(coconutIntakes.intakeDate, filters.endDate)
        )
      );
    }
    if (filters.distributorId) {
      query = query.where(eq(coconutIntakes.distributorId, filters.distributorId));
    }
  }

  return await query.orderBy(desc(coconutIntakes.intakeDate));
}

export async function getCoconutIntakeById(id: number) {
  await requireAuth(['pegawai_rmp', 'staff_hr', 'manajer']);
  
  const [intake] = await db
    .select({
      id: coconutIntakes.id,
      intakeDate: coconutIntakes.intakeDate,
      weight: coconutIntakes.weight,
      grade: coconutIntakes.grade,
      notes: coconutIntakes.notes,
      distributor: {
        id: distributors.id,
        name: distributors.name,
        contactPerson: distributors.contactPerson,
        phone: distributors.phone,
      },
      createdAt: coconutIntakes.createdAt,
      updatedAt: coconutIntakes.updatedAt,
    })
    .from(coconutIntakes)
    .leftJoin(distributors, eq(coconutIntakes.distributorId, distributors.id))
    .where(eq(coconutIntakes.id, id));
  
  return intake;
}

export async function createCoconutIntake(data: CoconutIntakeInput) {
  const user = await requireAuth(['pegawai_rmp']);
  
  const [result] = await db
    .insert(coconutIntakes)
    .values({
      intakeDate: data.intakeDate,
      distributorId: data.distributorId,
      weight: data.weight,
      grade: data.grade,
      notes: data.notes,
    })
    .returning();
  
  return result;
}

// Sorting Record Services
export async function getAllSortingRecords(filters?: { startDate?: string; endDate?: string; intakeId?: number }) {
  await requireAuth(['pegawai_rmp', 'staff_hr', 'manajer']);
  
  let query = db
    .select({
      id: sortingRecords.id,
      sortedDate: sortingRecords.sortedDate,
      goodCoconuts: sortingRecords.goodCoconuts,
      badCoconuts: sortingRecords.badCoconuts,
      notes: sortingRecords.notes,
      intake: {
        id: coconutIntakes.id,
        intakeDate: coconutIntakes.intakeDate,
        weight: coconutIntakes.weight,
        distributor: {
          id: distributors.id,
          name: distributors.name,
        },
      },
      createdAt: sortingRecords.createdAt,
    })
    .from(sortingRecords)
    .leftJoin(coconutIntakes, eq(sortingRecords.intakeId, coconutIntakes.id))
    .leftJoin(distributors, eq(coconutIntakes.distributorId, distributors.id));

  if (filters) {
    if (filters.startDate && filters.endDate) {
      query = query.where(
        and(
          gte(sortingRecords.sortedDate, filters.startDate),
          lte(sortingRecords.sortedDate, filters.endDate)
        )
      );
    }
    if (filters.intakeId) {
      query = query.where(eq(sortingRecords.intakeId, filters.intakeId));
    }
  }

  return await query.orderBy(desc(sortingRecords.sortedDate));
}

export async function getSortingRecordById(id: number) {
  await requireAuth(['pegawai_rmp', 'staff_hr', 'manajer']);
  
  const [record] = await db
    .select({
      id: sortingRecords.id,
      sortedDate: sortingRecords.sortedDate,
      goodCoconuts: sortingRecords.goodCoconuts,
      badCoconuts: sortingRecords.badCoconuts,
      notes: sortingRecords.notes,
      intake: {
        id: coconutIntakes.id,
        intakeDate: coconutIntakes.intakeDate,
        weight: coconutIntakes.weight,
        grade: coconutIntakes.grade,
        distributor: {
          id: distributors.id,
          name: distributors.name,
        },
      },
      createdAt: sortingRecords.createdAt,
      updatedAt: sortingRecords.updatedAt,
    })
    .from(sortingRecords)
    .leftJoin(coconutIntakes, eq(sortingRecords.intakeId, coconutIntakes.id))
    .leftJoin(distributors, eq(coconutIntakes.distributorId, distributors.id))
    .where(eq(sortingRecords.id, id));
  
  return record;
}

export async function createSortingRecord(data: SortingRecordInput) {
  const user = await requireAuth(['pegawai_rmp']);
  
  const [result] = await db
    .insert(sortingRecords)
    .values({
      intakeId: data.intakeId,
      sortedDate: data.sortedDate,
      goodCoconuts: data.goodCoconuts,
      badCoconuts: data.badCoconuts,
      notes: data.notes,
    })
    .returning();
  
  return result;
}