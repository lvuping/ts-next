import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });

  test('should show login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Welcome to Notes PKM' })).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('should show error with wrong password', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    await expect(page.getByText('Invalid password')).toBeVisible();
  });

  test('should login with correct password', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Password').fill('changeme123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Notes PKM' })).toBeVisible();
  });

  test('should logout successfully', async ({ page, context }) => {
    // Set auth cookie first
    await context.addCookies([{
      name: 'authenticated',
      value: 'true',
      domain: 'localhost',
      path: '/',
    }]);
    
    await page.goto('/');
    await page.getByRole('button', { name: 'Logout' }).click();
    
    await expect(page).toHaveURL('/login');
  });
});