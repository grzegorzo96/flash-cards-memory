import { Page } from '@playwright/test';

/**
 * Authentication fixtures and helpers for E2E tests
 */

export interface TestUser {
  email: string;
  password: string;
  id?: string;
}

export const testUsers = {
  validUser: {
    email: process.env.E2E_USERNAME || 'grze963@gmail.com',
    password: process.env.E2E_PASSWORD || 'Dupa123#@!',
    id: process.env.E2E_USERNAME_ID || '9a8a6f77-4bf9-49f3-9844-c9586444a62f',
  },
  anonymousUser: {
    email: '',
    password: '',
    id: 'anonymous-user-456',
  },
};

/**
 * Login helper for E2E tests
 * Use this to authenticate users before running tests
 */
export async function loginAsUser(page: Page, user: TestUser) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  
  // Clear and fill email
  const emailInput = page.getByTestId('email-input');
  await emailInput.clear();
  await emailInput.fill(user.email);
  
  // Clear and fill password - using pressSequentially for special characters
  const passwordInput = page.getByTestId('password-input');
  await passwordInput.clear();
  await passwordInput.pressSequentially(user.password, { delay: 50 });
  
  // Verify password was entered correctly (check length)
  const passwordValue = await passwordInput.inputValue();
  if (passwordValue.length !== user.password.length) {
    throw new Error(`Password not fully entered. Expected ${user.password.length} chars, got ${passwordValue.length}`);
  }
  
  // Click submit and wait for navigation
  await Promise.all([
    page.waitForURL(/\/(dashboard|$)/, { timeout: 15000 }),
    page.getByTestId('login-submit-button').click()
  ]);
  
  // If redirected to home page, login failed
  if (page.url().endsWith('/') || page.url().includes('/login')) {
    // Check for error messages
    const errorAlert = page.getByRole('alert');
    if (await errorAlert.isVisible()) {
      const errorText = await errorAlert.textContent();
      throw new Error(`Login failed: ${errorText}`);
    }
    throw new Error('Login failed - redirected to home or stayed on login page');
  }
}

/**
 * Setup authentication state for tests
 * This can be used to bypass login for faster tests
 */
export async function setupAuthState(page: Page, user: TestUser) {
  // Option 1: Use cookies/localStorage if your app supports it
  await page.context().addCookies([
    {
      name: 'auth_token',
      value: 'test-auth-token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
    },
  ]);

  // Option 2: Set localStorage
  await page.goto('/');
  await page.evaluate((userId) => {
    localStorage.setItem('user_id', userId);
    localStorage.setItem('authenticated', 'true');
  }, user.id);
}

/**
 * Logout helper
 */
export async function logout(page: Page) {
  await page.goto('/logout');
  // Or click logout button if available
  // await page.getByRole('button', { name: /logout|sign out/i }).click();
}
