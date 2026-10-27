import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { hashPassword, verifyPassword } from '../src/features/auth/password';
import { adminProvisioningSchema } from '../src/features/auth/schemas';
import { loadTestEnvironment } from './test-environment';

async function main() {
  const result = adminProvisioningSchema.safeParse({
    email: process.env.E2E_ADMIN_EMAIL,
    password: process.env.E2E_ADMIN_PASSWORD,
  });

  if (!result.success) {
    throw new Error(
      'Set E2E_ADMIN_EMAIL and a 12-character E2E_ADMIN_PASSWORD for auth tests.',
    );
  }

  const environment = loadTestEnvironment();

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: environment.DATABASE_URL }),
  });

  try {
    const existing = await prisma.user.findUnique({
      where: { email: result.data.email },
      select: { passwordHash: true, isActive: true, role: true },
    });

    if (existing) {
      if (
        existing.role !== 'ADMIN' ||
        !existing.isActive ||
        !(await verifyPassword(result.data.password, existing.passwordHash))
      ) {
        throw new Error(
          'The existing E2E administrator does not match the configured test credentials.',
        );
      }
    } else {
      await prisma.user.create({
        data: {
          email: result.data.email,
          name: 'E2E Administrator',
          passwordHash: await hashPassword(result.data.password),
          role: 'ADMIN',
        },
      });
    }
  } finally {
    await prisma.$disconnect();
  }
}

void main();
