'use server';

import { Prisma } from '@/generated/prisma/client';
import { requireAdmin } from '@/features/auth/authorization';
import { getPrismaClient } from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z, type ZodSafeParseError } from 'zod';
import { categoryInputSchema } from './schemas';

export type CategoryFormValues = {
  name: string;
  slug: string;
  isActive: boolean;
};

export type CategoryActionState = {
  message?: string;
  fieldErrors?: Partial<Record<keyof CategoryFormValues, string>>;
  values?: CategoryFormValues;
};

function formValues(formData: FormData): CategoryFormValues {
  return {
    name: String(formData.get('name') ?? ''),
    slug: String(formData.get('slug') ?? ''),
    isActive: formData.get('isActive') === 'on',
  };
}

function parseInput(formData: FormData) {
  return categoryInputSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    isActive: formData.get('isActive') === 'on',
  });
}

function validationState(
  formData: FormData,
  error: ZodSafeParseError<unknown>,
): CategoryActionState {
  return {
    message: 'Review the highlighted fields.',
    fieldErrors: Object.fromEntries(
      error.error.issues.map((issue) => [
        String(issue.path[0]) as keyof CategoryFormValues,
        issue.message,
      ]),
    ),
    values: formValues(formData),
  };
}

function isKnownRequestError(error: unknown, code: string) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === code
  );
}

const categoryIdSchema = z.string().trim().min(1);
const statusInputSchema = z.object({
  id: categoryIdSchema,
  isActive: z.enum(['true', 'false']).transform((value) => value === 'true'),
});

async function revalidateCategoryPaths(categoryId?: string) {
  revalidatePath('/products');
  revalidatePath('/admin/categories');
  revalidatePath('/admin/products');

  if (!categoryId) return;
  const prisma = getPrismaClient();
  if (!prisma) return;
  const products = await prisma.product.findMany({
    where: { categoryId },
    select: { slug: true },
  });
  products.forEach((product) => revalidatePath(`/products/${product.slug}`));
}

export async function createCategoryAction(
  _previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireAdmin();
  const result = parseInput(formData);
  if (!result.success) return validationState(formData, result);

  const prisma = getPrismaClient();
  if (!prisma) return { message: 'The database is unavailable. Try again.' };

  try {
    await prisma.category.create({ data: result.data });
  } catch (error) {
    if (isKnownRequestError(error, 'P2002')) {
      return {
        message: 'Review the highlighted fields.',
        fieldErrors: { slug: 'That slug is already in use.' },
        values: formValues(formData),
      };
    }
    throw error;
  }

  await revalidateCategoryPaths();
  redirect('/admin/categories?success=created');
}

export async function updateCategoryAction(
  id: string,
  _previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireAdmin();
  const result = parseInput(formData);
  if (!result.success) return validationState(formData, result);

  const validId = categoryIdSchema.safeParse(id);
  if (!validId.success) return { message: 'Category not found.' };
  const prisma = getPrismaClient();
  if (!prisma) return { message: 'The database is unavailable. Try again.' };

  try {
    await prisma.category.update({
      where: { id: validId.data },
      data: result.data,
    });
  } catch (error) {
    if (isKnownRequestError(error, 'P2002')) {
      return {
        message: 'Review the highlighted fields.',
        fieldErrors: { slug: 'That slug is already in use.' },
        values: formValues(formData),
      };
    }
    if (isKnownRequestError(error, 'P2025')) {
      return { message: 'Category not found.' };
    }
    throw error;
  }

  await revalidateCategoryPaths(validId.data);
  redirect('/admin/categories?success=updated');
}

export async function toggleCategoryStatusAction(formData: FormData) {
  await requireAdmin();
  const result = statusInputSchema.safeParse({
    id: formData.get('id'),
    isActive: formData.get('isActive'),
  });
  if (!result.success) return;

  const prisma = getPrismaClient();
  if (!prisma) return;

  try {
    await prisma.category.update({
      where: { id: result.data.id },
      data: { isActive: result.data.isActive },
    });
  } catch (error) {
    if (isKnownRequestError(error, 'P2025')) return;
    throw error;
  }

  await revalidateCategoryPaths(result.data.id);
}
