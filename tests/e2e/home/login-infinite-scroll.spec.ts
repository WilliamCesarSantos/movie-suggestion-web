import { test, expect } from '@playwright/test';

test('login and browse infinite scroll', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('E-mail').fill('joe@example.com');
  await page.getByPlaceholder('Senha').fill('123456');
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
});
