import { test, expect } from '@playwright/test';
import { SidebarComponent, MobileNavComponent } from './components';
import { LandingPage, LoginPage } from './pages';
import { loginAsUser, testUsers } from './fixtures/auth.fixtures';

/**
 * E2E Test Suite: User Logout Flow
 * Tests the complete logout process from both desktop and mobile views
 */

test.describe('Logout Flow', () => {
  // Setup: Login before each test
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page, testUsers.validUser);
  });

  test.describe('Desktop Logout', () => {
    test('should logout successfully from desktop sidebar', async ({ page }) => {
      // Navigate to dashboard (authenticated)
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Initialize Page Objects
      const sidebar = new SidebarComponent(page);
      const landingPage = new LandingPage(page);

      // Verify sidebar is visible (desktop view)
      await expect(sidebar.container).toBeVisible();

      // Verify user menu shows user information
      await expect(sidebar.userMenu.container).toBeVisible();
      await expect(sidebar.userMenu.userEmail).toBeVisible();

      // Click logout button
      await sidebar.logout();

      // Verify redirect to landing page
      await page.waitForURL('/');
      await expect(landingPage.container).toBeVisible();

      // Verify guest navigation is shown
      expect(await landingPage.isGuestNavigationVisible()).toBe(true);
      await expect(landingPage.loginLink).toBeVisible();
      await expect(landingPage.registerLink).toBeVisible();
    });

    test('should not access protected routes after logout', async ({ page }) => {
      // Navigate to dashboard
      await page.goto('/dashboard');

      // Logout
      const sidebar = new SidebarComponent(page);
      await sidebar.logout();

      // Try to access dashboard again
      await page.goto('/dashboard');

      // Should be redirected to login or landing
      await page.waitForURL(/\/(login|$)/);
      expect(page.url()).toMatch(/\/(login|$)/);
    });
  });

  test.describe('Logout and Return Flow', () => {
    test('should be able to login again after logout', async ({ page }) => {
      // Navigate to dashboard
      await page.goto('/dashboard');

      // Logout
      const sidebar = new SidebarComponent(page);
      await sidebar.logout();

      // Verify on landing page
      const landingPage = new LandingPage(page);
      await expect(landingPage.container).toBeVisible();

      // Navigate to login
      await landingPage.goToLogin();

      // Verify on login page
      const loginPage = new LoginPage(page);
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.submitButton).toBeVisible();
    });
  });

  test.describe('User Menu Verification', () => {
    test('should display correct user information before logout', async ({ page }) => {
      await page.goto('/dashboard');

      const sidebar = new SidebarComponent(page);

      // Verify user menu displays information
      await expect(sidebar.userMenu.userAvatar).toBeVisible();
      await expect(sidebar.userMenu.userEmail).toBeVisible();

      // Get user email and verify it's not empty
      const email = await sidebar.userMenu.getUserEmail();
      expect(email).toBeTruthy();
      expect(email.length).toBeGreaterThan(0);

      // Get user initials and verify format
      const initials = await sidebar.userMenu.getUserInitials();
      expect(initials).toBeTruthy();
      expect(initials.length).toBeGreaterThanOrEqual(1);
      expect(initials.length).toBeLessThanOrEqual(2);
    });
  });
});
