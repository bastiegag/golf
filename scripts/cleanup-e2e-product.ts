import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const slug = process.argv[2];
const databaseUrl = process.env.E2E_DATABASE_URL;

if (!slug || !databaseUrl) {
  throw new Error('A product slug and E2E_DATABASE_URL are required.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

try {
  await prisma.product.deleteMany({
    where: { slug: { in: [slug, `${slug}-updated`] } },
  });
} finally {
  await prisma.$disconnect();
}
