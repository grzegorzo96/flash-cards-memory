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
    email: 'test@example.com',
    password: 'Test123!@#',
    id: 'test-user-123',
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
  await page.getByLabel(/email/i).fill(user.email);
  await page.getByLabel(/password/i).fill(user.password);
  await page.getByRole('button', { name: /sign in|login|log in/i }).click();
  
  // Wait for successful login (adjust based on your app's behavior)
  await page.waitForURL(/\/dashboard|\/$/);
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
