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

test('visitors can submit checkout and receive a confirmation', async ({
  page,
}) => {
  await page.goto('/products/harbor-knit');
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await page.getByRole('link', { name: 'Cart (1 items)' }).click();
  await page.getByRole('link', { name: 'Proceed to checkout' }).click();

  await page.getByLabel('Full name').fill('Alex Morgan');
  await page.getByLabel('Email address').fill('alex@example.com');
  await page.getByLabel('Street address').fill('10 Main Street');
  await page.getByLabel('City').fill('Toronto');
  await page.getByLabel('Province, state, or region').fill('Ontario');
  await page.getByLabel('Postal or ZIP code').fill('M5V 2T6');
  await page.getByLabel('Country').fill('Canada');
  await page.getByRole('button', { name: 'Place order' }).click();

  await expect(
    page.getByRole('heading', { name: 'Thank you, Alex Morgan.' }),
  ).toBeVisible();
  await expect(page.getByText('$68.00').first()).toBeVisible();
  await page.goto('/cart');
  await expect(page.getByText('Your cart is empty')).toBeVisible();
});

test('checkout explains when the cart is empty', async ({ page }) => {
  await page.goto('/checkout');

  await expect(page.getByText('Your cart is empty')).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Continue shopping' }),
  ).toBeVisible();
});

test('confirmation pages require a valid access token', async ({ page }) => {
  const response = await page.goto(
    '/orders/GOLF-NOT-REAL/confirmation?token=not-a-valid-token',
  );

  expect(response).not.toBeNull();
  expect(response?.headers()['cache-control']).toContain('no-store');
  expect(response?.headers()['referrer-policy']).toBe('no-referrer');
  expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow');
  await expect(
    page.getByRole('heading', { name: 'Page not found' }),
  ).toBeVisible();
});

test('unknown product URLs return not found', async ({ page }) => {
  await page.goto('/products/not-a-real-product');
  await expect(
    page.getByRole('heading', { name: 'Page not found' }),
  ).toBeVisible();
});
