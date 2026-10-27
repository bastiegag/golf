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

async function removeProduct(slug: string) {
  execFileSync(
    process.platform === 'win32' ? 'npm.cmd' : 'npm',
    ['exec', '--', 'tsx', 'scripts/cleanup-e2e-product.ts', slug],
    { env: process.env, stdio: 'inherit' },
  );
}

test.describe('administrator product management', () => {
  test('creates, edits, hides, and reactivates a product', async ({ page }) => {
    const slug = `e2e-product-${randomUUID()}`;
    const updatedSlug = `${slug}-updated`;

    try {
      await page.goto('/admin/login');
      await page.getByLabel('Email').fill(adminEmail!);
      await page.getByLabel('Password').fill(adminPassword!);
      await page.getByRole('button', { name: 'Sign in' }).click();
      await expect(page).toHaveURL(/\/admin$/);

      await page.goto('/admin/products/new');
      await page.getByLabel('Name').fill('E2E Product');
      await page.getByLabel('Slug').fill(slug);
      await page.getByLabel('Description').fill('A product created by the E2E suite.');
      await page.getByLabel('Price').fill('31.25');
      await page.getByLabel('Category').selectOption({ label: 'Clothing' });
      await page.getByRole('button', { name: 'Create product' }).click();

      await expect(page).toHaveURL(/\/admin\/products\?success=created/);
      await expect(page.getByText('E2E Product')).toBeVisible();

      await page.goto(`/products/${slug}`);
      await expect(page.getByRole('heading', { name: 'E2E Product' })).toBeVisible();
      const editHref = await page
        .getByRole('row')
        .filter({ hasText: 'E2E Product' })
        .getByRole('link', { name: 'Edit' })
        .getAttribute('href');
      await page.goto(editHref!);
      await page.getByLabel('Name').fill('Updated E2E Product');
      await page.getByLabel('Slug').fill(updatedSlug);
      await page.getByLabel('Price').fill('42.50');
      await page.getByRole('button', { name: 'Save changes' }).click();

      await expect(page).toHaveURL(/\/admin\/products\?success=updated/);
      await page.goto(`/products/${slug}`);
      await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
      await page.goto(`/products/${updatedSlug}`);
      await expect(page.getByRole('heading', { name: 'Updated E2E Product' })).toBeVisible();

      await page.goto('/admin/products');
      const row = page.getByRole('row').filter({ hasText: 'Updated E2E Product' });
      await row.getByRole('button', { name: 'Deactivate' }).click();
      await expect(row.getByRole('button', { name: 'Activate' })).toBeVisible();
      await page.goto(`/products/${updatedSlug}`);
      await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();

      await page.goto('/admin/products');
      await page.getByRole('row').filter({ hasText: 'Updated E2E Product' }).getByRole('button', { name: 'Activate' }).click();
      await page.goto(`/products/${updatedSlug}`);
      await expect(page.getByRole('heading', { name: 'Updated E2E Product' })).toBeVisible();
    } finally {
      await removeProduct(slug);
    }
  });

  test('preserves validation feedback and blocks unauthenticated product pages', async ({
    page,
  }) => {
    await page.goto('/admin/products/new');
    await expect(page).toHaveURL(/\/admin\/login$/);

    await page.goto('/admin/login');
    await page.getByLabel('Email').fill(adminEmail!);
    await page.getByLabel('Password').fill(adminPassword!);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.goto('/admin/products/new');
    await page.getByLabel('Name').fill('Validation Product');
    await page.getByRole('button', { name: 'Create product' }).click();

    await expect(page.getByRole('alert')).toContainText('Review the highlighted fields.');
    await expect(page.getByLabel('Name')).toHaveValue('Validation Product');
  });
});
