import { expect, test } from '@playwright/test';

test('homepage introduces the store', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: 'Good things, made to be kept.' }),
  ).toBeVisible();
});

test('visitors can navigate to the product collection', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Shop', exact: true }).click();

  await expect(
    page.getByRole('heading', {
      name: 'Thoughtful things for everyday.',
    }),
  ).toBeVisible();
  await expect(page.getByText(/No products yet/)).toBeVisible();
});
