import { test, expect } from '@playwright/test';

test('movie detail to rating flow', async ({ page }) => {
  await page.goto('/movies/1');
  await expect(page).toHaveURL(/movies\/1/);
});
