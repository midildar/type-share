import { test, expect } from '@playwright/test';

test('has dashboard title and create button', async ({ page }) => {
  // Note: If your app requires login first, mention in your README 
  // that testing was scoped to the dashboard UI for time.
  await page.goto('http://localhost:3000/dashboard');

  // Check for the main heading
  await expect(page.locator('h1', { hasText: 'Your Documents' })).toBeVisible();

  // Check for the create button
  await expect(page.locator('button', { hasText: '+ New Blank Document' })).toBeVisible();
});