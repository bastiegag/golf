import 'server-only';

import { getPrismaClient } from '@/lib/db/prisma';

export async function getUserByEmail(email: string) {
  const prisma = getPrismaClient();
  if (!prisma) {
    return null;
  }

  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      passwordHash: true,
      role: true,
      isActive: true,
    },
  });
}

export async function getActiveAdminById(id: string) {
  const prisma = getPrismaClient();
  if (!prisma) {
    return null;
  }

  return prisma.user.findFirst({
    where: { id, role: 'ADMIN', isActive: true },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });
}
