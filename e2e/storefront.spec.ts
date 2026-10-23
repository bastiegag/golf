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

  const productLink = page.locator('a[href^="/products/"]').first();
  if (await productLink.count()) {
    await productLink.click();
    await expect(
      page.locator('h1'),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: '← Back to the collection' }),
    ).toBeVisible();
  } else {
    await expect(page.getByText(/No products yet/)).toBeVisible();
  }
});

test('unknown product URLs return not found', async ({ page }) => {
  await page.goto('/products/not-a-real-product');
  await expect(
    page.getByRole('heading', { name: 'Page not found' }),
  ).toBeVisible();
});
