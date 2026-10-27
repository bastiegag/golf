import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;

if (!adminEmail || !adminPassword || !process.env.E2E_DATABASE_URL) {
  throw new Error(
    'E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD, and E2E_DATABASE_URL are required.',
  );
}

function runCleanup(
  productId: string | undefined,
  productSlug: string,
  categoryId: string | undefined,
  categorySlug: string,
  updatedCategorySlug: string,
) {
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const env = process.env;
  let cleanupError: unknown;
  try {
    execFileSync(
      npm,
      [
        'exec',
        '--',
        'tsx',
        'scripts/cleanup-e2e-product.ts',
        productId ?? '-',
        productSlug,
        `${productSlug}-updated`,
      ],
      { env, stdio: 'inherit' },
    );
  } catch (error) {
    cleanupError = error;
  }
  try {
    execFileSync(
      npm,
      [
        'exec',
        '--',
        'tsx',
        'scripts/cleanup-e2e-category.ts',
        categoryId ?? '-',
        categorySlug,
        updatedCategorySlug,
      ],
      { env, stdio: 'inherit' },
    );
  } catch (error) {
    if (cleanupError) {
      console.error('Category cleanup also failed after product cleanup failed.', error);
    } else {
      cleanupError = error;
    }
  }
  if (cleanupError) throw cleanupError;
}

test('administrator can manage category visibility', async ({ page }) => {
  const suffix = randomUUID();
  const categorySlug = `e2e-category-${suffix}`;
  const updatedCategorySlug = `${categorySlug}-updated`;
  const productSlug = `e2e-product-${suffix}`;
  const categoryName = `E2E Category ${suffix}`;
  const updatedCategoryName = `Updated E2E Category ${suffix}`;
  const productName = `E2E Category Product ${suffix}`;
  let categoryId: string | undefined;
  let productId: string | undefined;

  try {
    await page.goto('/admin/login');
    await page.getByLabel('Email').fill(adminEmail!);
    await page.getByLabel('Password').fill(adminPassword!);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/\/admin$/);

    await page.goto('/admin/categories/new');
    await page.getByLabel('Name').fill(categoryName);
    await page.getByLabel('Slug').fill(categorySlug);
    await page.getByRole('button', { name: 'Create category' }).click();
    await expect(page).toHaveURL(/\/admin\/categories\?success=created/);

    const categoryRow = page.getByRole('row').filter({ hasText: categoryName });
    await expect(categoryRow).toBeVisible();
    const categoryEditHref = await categoryRow
      .getByRole('link', { name: 'Edit' })
      .getAttribute('href');
    categoryId = categoryEditHref?.split('/')[3];

    await page.goto('/admin/categories');
    await page.getByRole('row').filter({ hasText: categoryName }).getByRole('link', { name: 'Edit' }).click();
    await page.getByLabel('Name').fill(updatedCategoryName);
    await page.getByLabel('Slug').fill(updatedCategorySlug);
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page).toHaveURL(/\/admin\/categories\?success=updated/);
    await expect(page.getByText(updatedCategoryName, { exact: true })).toBeVisible();

    await page.goto('/admin/products/new');
    await page.getByLabel('Name').fill(productName);
    await page.getByLabel('Slug').fill(productSlug);
    await page.getByLabel('Description').fill('A category visibility product.');
    await page.getByLabel('Price').fill('27.00');
    await page.getByLabel('Category').selectOption({ label: updatedCategoryName });
    await page.getByRole('button', { name: 'Create product' }).click();
    await expect(page).toHaveURL(/\/admin\/products\?success=created/);

    const productRow = page.getByRole('row').filter({ hasText: productName });
    const productEditHref = await productRow
      .getByRole('link', { name: 'Edit' })
      .getAttribute('href');
    productId = productEditHref?.split('/')[3];
    await page.goto(`/products/${productSlug}`);
    await expect(page.getByRole('heading', { name: productName })).toBeVisible();

    await page.goto('/admin/categories');
    const updatedRow = page.getByRole('row').filter({ hasText: updatedCategoryName });
    page.once('dialog', (dialog) => dialog.dismiss());
    await updatedRow.getByRole('button', { name: 'Deactivate' }).click();
    await expect(updatedRow.getByRole('button', { name: 'Deactivate' })).toBeVisible();
    await page.goto(`/products/${productSlug}`);
    await expect(page.getByRole('heading', { name: productName })).toBeVisible();

    await page.goto('/admin/categories');
    const activeRow = page.getByRole('row').filter({ hasText: updatedCategoryName });
    page.once('dialog', (dialog) => dialog.accept());
    await activeRow.getByRole('button', { name: 'Deactivate' }).click();
    await expect(activeRow.getByRole('button', { name: 'Activate' })).toBeVisible();
    await page.goto('/products');
    await expect(page.getByRole('link', { name: updatedCategoryName })).not.toBeVisible();
    await page.goto(`/products/${productSlug}`);
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();

    await page.goto('/admin/categories');
    const inactiveRow = page.getByRole('row').filter({ hasText: updatedCategoryName });
    await inactiveRow.getByRole('button', { name: 'Activate' }).click();
    await expect(inactiveRow.getByRole('button', { name: 'Deactivate' })).toBeVisible();
    await page.goto(`/products/${productSlug}`);
    await expect(page.getByRole('heading', { name: productName })).toBeVisible();

    await page.goto('/admin/products');
    await expect(
      page.getByRole('row').filter({ hasText: productName }).getByText(updatedCategoryName),
    ).toBeVisible();
  } finally {
    runCleanup(productId, productSlug, categoryId, categorySlug, updatedCategorySlug);
  }
});
