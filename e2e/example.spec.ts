import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

/**
 * Example E2E test using Playwright
 * Demonstrates:
 * - Page Object Model usage
 * - Browser context isolation
 * - Proper assertions
 * - Test hooks
 */

test.describe('Example E2E Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app before each test
    await page.goto('/');
  });

  test('should load the homepage', async ({ page }) => {
    // Assert the page title or heading
    await expect(page).toHaveTitle(/FlashCardMemory|10xCards/i);
  });

  test('should navigate to login page', async ({ page }) => {
    // Arrange - using Page Object Model
    const loginPage = new LoginPage(page);
    
    // Act
    await loginPage.goto();
    
    // Assert
    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
  });

  test('should show error on invalid login', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    // Act
    await loginPage.login('invalid@email.com', 'wrongpassword');
    
    // Assert - Check for error message
    // Note: Adjust selector based on your actual error message implementation
    await expect(page.getByText(/invalid|error|wrong/i)).toBeVisible();
  });
});

test.describe('API Testing Example', () => {
  test('should make API request', async ({ request }) => {
    // Make API request
    const response = await request.get('/api/dashboard');
    
    // Assert response
    expect(response.ok()).toBeTruthy();
    
    // Parse and check JSON response
    const data = await response.json();
    expect(data).toHaveProperty('totalDecks');
  });
});

test.describe('Visual Testing Example', () => {
  test('should match visual snapshot', async ({ page }) => {
    await page.goto('/');
    
    // Take screenshot and compare
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      // First run will create baseline, subsequent runs will compare
    });
  });
});
