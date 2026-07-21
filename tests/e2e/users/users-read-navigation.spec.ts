import { test, expect } from '@playwright/test';

test('users:read navigation', async ({ page }) => {
  await page.goto('/users');
  await expect(page).toHaveURL(/users/);
});
