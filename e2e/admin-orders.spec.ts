import { expect, test, type Page } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;
if (!adminEmail || !adminPassword || !process.env.E2E_DATABASE_URL) {
  throw new Error(
    'E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD, and E2E_DATABASE_URL are required.',
  );
}

test.describe.configure({ mode: 'serial' });

type OrderFixture = {
  orderId: string;
  orderNumber: string;
  productId: string;
  productSlug: string;
  customerEmail: string;
};

function runScript(script: string, args: string[]) {
  return execFileSync(
    process.execPath,
    ['node_modules/tsx/dist/cli.mjs', script, ...args],
    { env: process.env, encoding: 'utf8' },
  );
}

function createFixture(marker: string): OrderFixture {
  const output = runScript('scripts/create-e2e-order.ts', [marker]);
  const line = output.trim().split('\n').at(-1);
  if (!line) throw new Error('Order fixture script returned no data.');
  return JSON.parse(line) as OrderFixture;
}

function cleanupFixture(marker: string, fixture?: OrderFixture) {
  const orderNumber = fixture?.orderNumber ?? `E2E-${marker}`;
  const productSlug = fixture?.productSlug ?? `e2e-order-product-${marker}`;
  runScript('scripts/cleanup-e2e-order.ts', [
    fixture?.orderId ?? '-',
    orderNumber,
    productSlug,
  ]);
}

async function signIn(page: Page) {
  await page.goto('/admin/login');
  await page.getByLabel('Email').fill(adminEmail!);
  await page.getByLabel('Password').fill(adminPassword!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

async function openOrder(page: Page, fixture: OrderFixture) {
  await page.goto('/admin/orders');
  await page.getByLabel('Search').fill(fixture.orderNumber);
  await page.getByRole('button', { name: 'Filter' }).click();
  const row = page.getByRole('row').filter({ hasText: fixture.orderNumber });
  await expect(row).toBeVisible();
  await row.getByRole('link', { name: 'View' }).click();
  await expect(page).toHaveURL(new RegExp(`/admin/orders/${fixture.orderId}$`));
}

async function updateStatus(page: Page, status: string) {
  await page.locator('#next-status').selectOption(status);
  await page.getByRole('button', { name: 'Update status' }).click();
}

test('administrator can complete an order fulfillment journey', async ({ page }) => {
  const marker = randomUUID();
  let fixture: OrderFixture | undefined;
  try {
    fixture = createFixture(marker);
    await signIn(page);
    await openOrder(page, fixture);

    await expect(page.getByText(fixture.customerEmail, { exact: true })).toBeVisible();
    await expect(page.getByText('1 E2E Test Street', { exact: true })).toBeVisible();
    await expect(page.getByText(`E2E Order Product ${marker}`, { exact: true })).toBeVisible();
    await expect(page.getByText('$37.00', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Pending', { exact: true }).first()).toBeVisible();

    await updateStatus(page, 'PROCESSING');
    await expect(page.getByRole('status')).toContainText('updated');
    await expect(page.getByText('Pending → Processing', { exact: true })).toBeVisible();

    await updateStatus(page, 'SHIPPED');
    await expect(page.getByText('Processing → Shipped', { exact: true })).toBeVisible();

    await updateStatus(page, 'DELIVERED');
    await expect(page.getByText('Shipped → Delivered', { exact: true })).toBeVisible();
    await expect(page.getByText('No further fulfillment transitions are available.', { exact: true })).toBeVisible();
  } finally {
    cleanupFixture(marker, fixture);
  }
});

test('cancellation confirmation can be dismissed or accepted', async ({ page }) => {
  const marker = randomUUID();
  let fixture: OrderFixture | undefined;
  try {
    fixture = createFixture(marker);
    await signIn(page);
    await openOrder(page, fixture);

    await page.locator('#next-status').selectOption('CANCELLED');
    page.once('dialog', (dialog) => dialog.dismiss());
    await page.getByRole('button', { name: 'Update status' }).click();
    await expect(page.getByText('Pending', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('No status changes recorded.', { exact: true })).toBeVisible();

    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Update status' }).click();
    await expect(page.getByText('Pending → Cancelled', { exact: true })).toBeVisible();
    await expect(page.getByText('No further fulfillment transitions are available.', { exact: true })).toBeVisible();
  } finally {
    cleanupFixture(marker, fixture);
  }
});

test('stale order forms are rejected after another session changes the order', async ({
  browser,
}) => {
  const marker = randomUUID();
  let fixture: OrderFixture | undefined;
  let firstPage: Page | undefined;
  let secondPage: Page | undefined;
  try {
    fixture = createFixture(marker);
    const firstContext = await browser.newContext();
    const secondContext = await browser.newContext();
    firstPage = await firstContext.newPage();
    secondPage = await secondContext.newPage();
    await Promise.all([signIn(firstPage), signIn(secondPage)]);
    await Promise.all([openOrder(firstPage, fixture), openOrder(secondPage, fixture)]);

    await updateStatus(firstPage, 'PROCESSING');
    await expect(firstPage.getByRole('status')).toContainText('updated');

    await secondPage.locator('#next-status').selectOption('CANCELLED');
    secondPage.once('dialog', (dialog) => dialog.accept());
    await secondPage.getByRole('button', { name: 'Update status' }).click();
    await expect(
      secondPage.getByText(
        'This order changed in another session. Refresh the page before updating its status.',
        { exact: true },
      ),
    ).toBeVisible();

    await secondPage.reload();
    await expect(secondPage.getByText('Processing', { exact: true }).first()).toBeVisible();
    await expect(secondPage.locator('#next-status')).toHaveValue('SHIPPED');
  } finally {
    await firstPage?.context().close();
    await secondPage?.context().close();
    cleanupFixture(marker, fixture);
  }
});

test('protects order routes and handles unknown orders', async ({ page }) => {
  await page.goto('/admin/orders');
  await expect(page).toHaveURL(/\/admin\/login/);
  await signIn(page);
  await page.goto('/admin/orders/unknown-order-id');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
});

test('search with no results and status filters are safe', async ({ page }) => {
  const marker = randomUUID();
  let fixture: OrderFixture | undefined;
  try {
    fixture = createFixture(marker);
    await signIn(page);
    await page.goto('/admin/orders');
    await page.getByLabel('Search').fill('does-not-exist-for-this-test');
    await page.getByRole('button', { name: 'Filter' }).click();
    await expect(page.getByText('No orders match these filters.', { exact: true })).toBeVisible();

    await page.getByLabel('Search').fill(fixture.orderNumber);
    await page.getByLabel('Status').selectOption('PENDING');
    await page.getByRole('button', { name: 'Filter' }).click();
    await expect(page.getByText(fixture.orderNumber, { exact: true })).toBeVisible();
  } finally {
    cleanupFixture(marker, fixture);
  }
});
