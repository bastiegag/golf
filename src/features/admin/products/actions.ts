'use server';

import { Prisma } from '@/generated/prisma/client';
import { z, type ZodSafeParseError } from 'zod';
import { requireAdmin } from '@/features/auth/authorization';
import { getPrismaClient } from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { productInputSchema } from './schemas';

export type ProductFormValues = {
  name: string;
  slug: string;
  description: string;
  price: string;
  imageUrl: string;
  categoryId: string;
  isActive: boolean;
};

export type ProductActionState = {
  message?: string;
  fieldErrors?: Partial<Record<string, string>>;
  values?: ProductFormValues;
};

function formValues(formData: FormData) {
  return {
    name: String(formData.get('name') ?? ''),
    slug: String(formData.get('slug') ?? ''),
    description: String(formData.get('description') ?? ''),
    price: String(formData.get('price') ?? ''),
    imageUrl: String(formData.get('imageUrl') ?? ''),
    categoryId: String(formData.get('categoryId') ?? ''),
    isActive: formData.get('isActive') === 'on',
  };
}

function parseInput(formData: FormData) {
  return productInputSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    price: formData.get('price'),
    imageUrl: formData.get('imageUrl'),
    categoryId: formData.get('categoryId'),
    isActive: formData.get('isActive') === 'on',
  });
}

function validationState(formData: FormData, error: ZodSafeParseError<unknown>) {
  return {
    message: 'Review the highlighted fields.',
    fieldErrors: Object.fromEntries(
      error.error.issues.map((issue) => [
        String(issue.path[0]),
        issue.message,
      ]),
    ),
    values: formValues(formData),
  } satisfies ProductActionState;
}

function isKnownRequestError(error: unknown, code: string) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;
}

const productIdSchema = z.string().trim().min(1);
const statusInputSchema = z.object({
  id: productIdSchema,
  isActive: z.enum(['true', 'false']).transform((value) => value === 'true'),
});

function revalidateProductPaths() {
  revalidatePath('/products');
  revalidatePath('/admin/products');
}

export async function createProductAction(
  _previousState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  await requireAdmin();
  const result = parseInput(formData);
  if (!result.success) return validationState(formData, result);

  const prisma = getPrismaClient();
  if (!prisma) return { message: 'The database is unavailable. Try again.' };

  try {
    const category = await prisma.category.findUnique({
      where: { id: result.data.categoryId },
      select: { id: true },
    });
    if (!category) {
      return {
        message: 'Review the highlighted fields.',
        fieldErrors: { categoryId: 'Select an existing category.' },
        values: formValues(formData),
      };
    }

    await prisma.product.create({
      data: {
        ...result.data,
        price: new Prisma.Decimal(result.data.price),
      },
    });
  } catch (error) {
    if (isKnownRequestError(error, 'P2002')) {
      return {
        message: 'Review the highlighted fields.',
        fieldErrors: { slug: 'That slug is already in use.' },
        values: formValues(formData),
      };
    }
    if (isKnownRequestError(error, 'P2003')) {
      return {
        message: 'The selected category is no longer available. Try again.',
        values: formValues(formData),
      };
    }
    throw error;
  }

  revalidateProductPaths();
  redirect('/admin/products?success=created');
}

export async function updateProductAction(
  id: string,
  _previousState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  await requireAdmin();
  const result = parseInput(formData);
  if (!result.success) return validationState(formData, result);

  const prisma = getPrismaClient();
  if (!prisma) return { message: 'The database is unavailable. Try again.' };

  let originalSlug: string | null = null;
  try {
    const validId = productIdSchema.safeParse(id);
    if (!validId.success) return { message: 'Product not found.' };
    const [product, category] = await Promise.all([
      prisma.product.findUnique({ where: { id: validId.data }, select: { id: true, slug: true } }),
      prisma.category.findUnique({
        where: { id: result.data.categoryId },
        select: { id: true },
      }),
    ]);
    if (!product) return { message: 'Product not found.' };
    originalSlug = product.slug;
    if (!category) {
      return {
        message: 'Review the highlighted fields.',
        fieldErrors: { categoryId: 'Select an existing category.' },
        values: formValues(formData),
      };
    }

    await prisma.product.update({
      where: { id: validId.data },
      data: { ...result.data, price: new Prisma.Decimal(result.data.price) },
    });
  } catch (error) {
    if (isKnownRequestError(error, 'P2002')) {
      return {
        message: 'Review the highlighted fields.',
        fieldErrors: { slug: 'That slug is already in use.' },
        values: formValues(formData),
      };
    }
    if (isKnownRequestError(error, 'P2003')) {
      return {
        message: 'The selected category is no longer available. Try again.',
        values: formValues(formData),
      };
    }
    throw error;
  }

  revalidateProductPaths();
  if (originalSlug) revalidatePath(`/products/${originalSlug}`);
  revalidatePath(`/products/${result.data.slug}`);
  redirect('/admin/products?success=updated');
}

export async function toggleProductStatusAction(formData: FormData) {
  await requireAdmin();
  const result = statusInputSchema.safeParse({
    id: formData.get('id'),
    isActive: formData.get('isActive'),
  });
  if (!result.success) {
    return;
  }

  const prisma = getPrismaClient();
  if (!prisma) return;

  try {
    await prisma.product.update({
      where: { id: result.data.id },
      data: { isActive: result.data.isActive },
    });
  } catch (error) {
    if (isKnownRequestError(error, 'P2025')) {
      return;
    }
    throw error;
  }
  revalidateProductPaths();
}
