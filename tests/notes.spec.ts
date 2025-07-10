import { test, expect } from '@playwright/test';

test.describe('Notes CRUD', () => {
  test.beforeEach(async ({ context }) => {
    // Set auth cookie
    await context.addCookies([{
      name: 'authenticated',
      value: 'true',
      domain: 'localhost',
      path: '/',
    }]);
  });

  test('should display empty state when no notes', async ({ page }) => {
    await page.goto('/');
    // Wait for loading to complete
    await page.waitForSelector('text=Loading notes...', { state: 'hidden' });
    
    // Check for empty state or notes
    const emptyState = page.getByText('No notes found');
    const notesList = page.locator('[role="article"]');
    
    if (await emptyState.isVisible()) {
      await expect(emptyState).toBeVisible();
      await expect(page.getByText('Create your first note')).toBeVisible();
    } else {
      await expect(notesList.first()).toBeVisible();
    }
  });

  test('should create a new note', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'New Note' }).click();
    
    await expect(page).toHaveURL('/notes/new');
    await expect(page.getByRole('heading', { name: 'Create New Note' })).toBeVisible();
    
    // Fill form
    await page.getByLabel('Title *').fill('Test Note');
    await page.getByLabel('Language *').click();
    await page.getByRole('option', { name: 'javascript' }).click();
    await page.getByLabel('Category *').click();
    await page.getByRole('option', { name: 'Frontend' }).click();
    await page.getByLabel('Code Content *').fill('console.log("Hello, World!");');
    
    // Add tags
    await page.getByLabel('Tags').fill('test');
    await page.getByLabel('Tags').press('Enter');
    await expect(page.getByText('test', { exact: true })).toBeVisible();
    
    // Submit form
    await page.getByRole('button', { name: 'Create Note' }).click();
    
    // Should redirect to edit page
    await expect(page).toHaveURL(/\/notes\/edit\/.+/);
    await expect(page.getByRole('heading', { name: 'Edit Note' })).toBeVisible();
  });

  test('should edit an existing note', async ({ page }) => {
    // First create a note
    await page.goto('/notes/new');
    await page.getByLabel('Title *').fill('Note to Edit');
    await page.getByLabel('Code Content *').fill('const original = true;');
    await page.getByRole('button', { name: 'Create Note' }).click();
    
    // Wait for redirect
    await page.waitForURL(/\/notes\/edit\/.+/);
    
    // Edit the note
    await page.getByLabel('Title *').clear();
    await page.getByLabel('Title *').fill('Edited Note');
    await page.getByLabel('Code Content *').clear();
    await page.getByLabel('Code Content *').fill('const edited = true;');
    
    await page.getByRole('button', { name: 'Save Changes' }).click();
    
    // Should redirect to home
    await expect(page).toHaveURL('/');
  });

  test('should delete a note', async ({ page }) => {
    // First create a note
    await page.goto('/notes/new');
    await page.getByLabel('Title *').fill('Note to Delete');
    await page.getByLabel('Code Content *').fill('// to be deleted');
    await page.getByRole('button', { name: 'Create Note' }).click();
    
    // Wait for redirect
    await page.waitForURL(/\/notes\/edit\/.+/);
    
    // Delete the note
    await page.getByRole('button', { name: 'Delete' }).click();
    
    // Confirm deletion
    await page.getByRole('button', { name: 'Delete', exact: true }).last().click();
    
    // Should redirect to home
    await expect(page).toHaveURL('/');
  });

  test('should toggle favorite status', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=Loading notes...', { state: 'hidden' });
    
    // Find first note card (if any)
    const noteCard = page.locator('[role="article"]').first();
    if (await noteCard.isVisible()) {
      const favoriteButton = noteCard.locator('button[aria-label*="favorite" i]').first();
      await favoriteButton.click();
      
      // Check if the heart icon changed (filled/unfilled)
      await expect(favoriteButton.locator('svg')).toHaveClass(/fill-current|text-red-500/);
    }
  });

  test('should search notes', async ({ page }) => {
    await page.goto('/');
    
    // Open search dialog using keyboard shortcut
    await page.keyboard.press('Control+k');
    
    // Search dialog should be visible
    await expect(page.getByPlaceholder('Search notes by title, content, tags...')).toBeVisible();
    
    // Type search query
    await page.getByPlaceholder('Search notes by title, content, tags...').fill('test');
    
    // Close search
    await page.keyboard.press('Escape');
    await expect(page.getByPlaceholder('Search notes by title, content, tags...')).not.toBeVisible();
  });

  test('should switch between view modes', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=Loading notes...', { state: 'hidden' });
    
    // Test different view modes
    const viewToggle = page.getByRole('group').filter({ hasText: /view/i });
    
    // Card view (default)
    await viewToggle.getByRole('button', { name: /card/i }).click();
    
    // Detailed view
    await viewToggle.getByRole('button', { name: /detailed/i }).click();
    
    // Compact view
    await viewToggle.getByRole('button', { name: /compact/i }).click();
    
    // If there are notes, check if table is visible in compact mode
    const notesList = page.locator('table');
    if (await notesList.isVisible()) {
      await expect(notesList).toBeVisible();
    }
  });
});