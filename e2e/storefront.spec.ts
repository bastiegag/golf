import { expect, test } from '@playwright/test';

test('homepage introduces the store', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: 'Good things, made to be kept.' }),
  ).toBeVisible();
});

test('visitors can filter the product collection by category', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Shop', exact: true }).click();

  await expect(
    page.getByRole('heading', {
      name: 'Thoughtful things for everyday.',
    }),
  ).toBeVisible();

  await page.getByRole('link', { name: 'Clothing' }).click();
  await expect(page).toHaveURL(/\/products\?category=clothing/);
  await expect(
    page.getByRole('heading', { name: 'Harbor Knit' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Everyday Tote' }),
  ).not.toBeVisible();

  await page.getByRole('link', { name: 'All products' }).click();
  await expect(page).toHaveURL(/\/products$/);
  await expect(
    page.getByRole('heading', { name: 'Everyday Tote' }),
  ).toBeVisible();
});

test('visitors can open a filtered catalogue directly', async ({ page }) => {
  await page.goto('/products?category=stationery');

  await expect(
    page.getByRole('heading', { name: 'Field Notes Set' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Harbor Knit' }),
  ).not.toBeVisible();
});

test('product details link back to their category', async ({ page }) => {
  await page.goto('/products/harbor-knit');

  await expect(
    page.getByRole('heading', { name: 'Harbor Knit' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Clothing' }),
  ).toHaveAttribute('href', '/products?category=clothing');
});

test('visitors can complete a persistent cart journey', async ({ page }) => {
  await page.goto('/products/harbor-knit');
  await page.getByRole('button', { name: 'Add to cart' }).click();

  await expect(
    page.getByRole('link', { name: 'Cart (1 items)' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Cart (1 items)' }).click();
  await expect(page).toHaveURL(/\/cart$/);
  await expect(
    page.getByRole('link', { name: 'Harbor Knit' }).first(),
  ).toBeVisible();
  await expect(page.getByText('$68.00').first()).toBeVisible();

  await page
    .getByRole('button', { name: 'Increase quantity of Harbor Knit' })
    .click();
  await expect(page.getByLabel('2 items', { exact: true })).toBeVisible();
  await expect(page.getByText('$136.00').first()).toBeVisible();

  await page.reload();
  await expect(page.getByLabel('2 items', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Remove' }).click();
  await expect(
    page.getByRole('heading', { name: 'Your cart', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Your cart is empty')).toBeVisible();
});

test('unknown product URLs return not found', async ({ page }) => {
  await page.goto('/products/not-a-real-product');
  await expect(
    page.getByRole('heading', { name: 'Page not found' }),
  ).toBeVisible();
});
