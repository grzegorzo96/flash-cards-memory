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
    // Remove quotes if they exist (from .env file)
    password: (process.env.E2E_PASSWORD || 'Dupa123!@#').replace(/^["']|["']$/g, ''),
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
  console.log('[E2E] Starting login process...');
  console.log('[E2E] Email:', user.email);
  console.log('[E2E] Password length:', user.password.length);
  console.log('[E2E] Password (first 3 chars):', user.password.substring(0, 3) + '...');
  
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  
  // Clear and fill email
  const emailInput = page.getByTestId('email-input');
  await emailInput.clear();
  await emailInput.fill(user.email);
  console.log('[E2E] Email entered');
  
  // Clear and fill password - using pressSequentially for special characters
  const passwordInput = page.getByTestId('password-input');
  await passwordInput.clear();
  await passwordInput.pressSequentially(user.password, { delay: 50 });
  
  // Verify password was entered correctly (check length)
  const passwordValue = await passwordInput.inputValue();
  console.log('[E2E] Password entered, length:', passwordValue.length);
  
  if (passwordValue.length !== user.password.length) {
    throw new Error(`Password not fully entered. Expected ${user.password.length} chars, got ${passwordValue.length}`);
  }
  
  // Take screenshot before clicking submit (in CI only)
  if (process.env.CI) {
    await page.screenshot({ path: 'before-login.png', fullPage: true });
    console.log('[E2E] Screenshot saved: before-login.png');
  }
  
  // Click submit and wait for navigation
  const timeout = process.env.CI ? 30000 : 15000;
  
  console.log('[E2E] Clicking submit button...');
  
  try {
    await Promise.all([
      page.waitForURL(/\/(dashboard|$)/, { timeout }),
      page.getByTestId('login-submit-button').click()
    ]);
  } catch (error) {
    // Take screenshot after failed login
    if (process.env.CI) {
      await page.screenshot({ path: 'after-login-failed.png', fullPage: true });
      console.log('[E2E] Screenshot saved: after-login-failed.png');
    }
    
    // Capture screenshot and error details
    console.error('Login navigation failed:', error);
    console.error('Current URL:', page.url());
    
    // Check for error messages
    const errorAlert = page.getByRole('alert');
    if (await errorAlert.isVisible({ timeout: 2000 }).catch(() => false)) {
      const errorText = await errorAlert.textContent();
      console.error('[E2E] Error alert found:', errorText);
      throw new Error(`Login failed with error: ${errorText}`);
    }
    
    // Check for any visible error text
    const bodyText = await page.textContent('body');
    console.error('[E2E] Page body text (first 500 chars):', bodyText?.substring(0, 500));
    
    throw new Error(`Login navigation timeout after ${timeout}ms. Current URL: ${page.url()}`);
  }
  
  console.log('[E2E] Navigation completed, current URL:', page.url());
  
  // If redirected to home page, login failed
  if (page.url().endsWith('/') || page.url().includes('/login')) {
    // Check for error messages
    const errorAlert = page.getByRole('alert');
    if (await errorAlert.isVisible({ timeout: 2000 }).catch(() => false)) {
      const errorText = await errorAlert.textContent();
      throw new Error(`Login failed: ${errorText}`);
    }
    throw new Error('Login failed - redirected to home or stayed on login page');
  }
  
  console.log('[E2E] Login successful!');
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
