import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { productSeedSchema } from '../src/features/products/schemas/product-schema';

const categorySeed = [
  { name: 'Clothing', slug: 'clothing' },
  { name: 'Accessories', slug: 'accessories' },
  { name: 'Stationery', slug: 'stationery' },
] as const;

const productSeed = productSeedSchema.array().parse([
  {
    name: 'Harbor Knit',
    slug: 'harbor-knit',
    description: 'A soft, easy layer for cool mornings.',
    price: '68.00',
    imageUrl: '/products/placeholder.svg',
    categorySlug: 'clothing',
  },
  {
    name: 'Everyday Tote',
    slug: 'everyday-tote',
    description: 'A sturdy carryall for wherever the day goes.',
    price: '42.00',
    imageUrl: '/products/placeholder.svg',
    categorySlug: 'accessories',
  },
  {
    name: 'Field Notes Set',
    slug: 'field-notes-set',
    description: 'Three pocket notebooks for ideas in motion.',
    price: '18.00',
    imageUrl: '/products/placeholder.svg',
    categorySlug: 'stationery',
  },
]);

async function seedProducts() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('Set DATABASE_URL before running the product seed.');
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    for (const category of categorySeed) {
      await prisma.category.upsert({
        where: { slug: category.slug },
        update: { name: category.name },
        create: { ...category, isActive: true },
      });
    }

    for (const product of productSeed) {
      const { categorySlug, ...productData } = product;

      await prisma.product.upsert({
        where: { slug: productData.slug },
        update: {
          ...productData,
          category: { connect: { slug: categorySlug } },
        },
        create: {
          ...productData,
          category: { connect: { slug: categorySlug } },
        },
      });
    }
  } finally {
    await prisma.$disconnect();
  }
}

seedProducts();
