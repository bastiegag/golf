'use server';

import { Prisma } from '@/generated/prisma/client';
import type { ZodSafeParseError } from 'zod';
import { requireAdmin } from '@/features/auth/authorization';
import { getPrismaClient } from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { productInputSchema } from './schemas';

export type ProductActionState = {
  message?: string;
  fieldErrors?: Partial<Record<string, string>>;
  values?: Record<string, string>;
};

function formValues(formData: FormData) {
  return Object.fromEntries(
    ['name', 'slug', 'description', 'price', 'imageUrl', 'categoryId'].map(
      (field) => [field, String(formData.get(field) ?? '')],
    ),
  );
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

  try {
    const [product, category] = await Promise.all([
      prisma.product.findUnique({ where: { id }, select: { id: true } }),
      prisma.category.findUnique({
        where: { id: result.data.categoryId },
        select: { id: true },
      }),
    ]);
    if (!product) return { message: 'Product not found.' };
    if (!category) {
      return {
        message: 'Review the highlighted fields.',
        fieldErrors: { categoryId: 'Select an existing category.' },
        values: formValues(formData),
      };
    }

    await prisma.product.update({
      where: { id },
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
  revalidatePath(`/products/${result.data.slug}`);
  redirect('/admin/products?success=updated');
}

export async function toggleProductStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  const isActive = formData.get('isActive') === 'true';
  if (!id) return;

  const prisma = getPrismaClient();
  if (!prisma) return;

  await prisma.product.update({
    where: { id },
    data: { isActive },
  });
  revalidateProductPaths();
}
