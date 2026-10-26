import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getActiveAdminById, getUserByEmail } from './queries';
import { verifyPassword } from './password';

const databaseUrl = process.env.DATABASE_URL;
const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;

if (!databaseUrl || !email || !password) {
  throw new Error(
    'E2E_DATABASE_URL, E2E_ADMIN_EMAIL, and E2E_ADMIN_PASSWORD are required.',
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

describe('administrator authentication PostgreSQL integration', () => {
  let adminId: string;

  beforeAll(async () => {
    const admin = await getUserByEmail(email);
    if (!admin) {
      throw new Error('The prepared E2E administrator was not found.');
    }
    adminId = admin.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('persists and verifies the provisioned password hash', async () => {
    const admin = await getUserByEmail(email);

    expect(admin).toMatchObject({
      email,
      role: 'ADMIN',
      isActive: true,
    });
    expect(await verifyPassword(password, admin!.passwordHash)).toBe(true);
    expect(await getActiveAdminById(adminId)).toMatchObject({ id: adminId });
  });

  it('does not authorize an inactive administrator', async () => {
    await prisma.user.update({
      where: { id: adminId },
      data: { isActive: false },
    });

    try {
      expect(await getActiveAdminById(adminId)).toBeNull();
    } finally {
      await prisma.user.update({
        where: { id: adminId },
        data: { isActive: true },
      });
    }
  });

  it('enforces unique administrator emails', async () => {
    await expect(
      prisma.user.create({
        data: {
          email,
          name: 'Duplicate',
          passwordHash: 'not-used',
          role: 'ADMIN',
        },
      }),
    ).rejects.toThrow();
  });
});
