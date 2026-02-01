import { Page, expect } from '@playwright/test';

/**
 * Common utilities for E2E tests
 */

/**
 * Wait for API response
 * Useful for testing that API calls complete successfully
 */
export async function waitForAPIResponse(
  page: Page,
  urlPattern: string | RegExp,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET'
) {
  return page.waitForResponse(
    (response) => {
      const matchesUrl =
        typeof urlPattern === 'string'
          ? response.url().includes(urlPattern)
          : urlPattern.test(response.url());
      return matchesUrl && response.request().method() === method;
    },
    { timeout: 10000 }
  );
}

/**
 * Wait for loading to complete
 * Waits for common loading indicators to disappear
 */
export async function waitForLoadingComplete(page: Page) {
  // Wait for common loading indicators
  await page.waitForLoadState('networkidle');
  
  // Wait for any loading spinners to disappear
  const spinner = page.getByRole('status').or(page.getByText(/loading/i));
  const isVisible = await spinner.isVisible().catch(() => false);
  
  if (isVisible) {
    await spinner.waitFor({ state: 'hidden', timeout: 10000 });
  }
}

/**
 * Check if element exists without throwing
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  try {
    const element = await page.$(selector);
    return element !== null;
  } catch {
    return false;
  }
}

/**
 * Fill form with data
 * Useful for filling multiple form fields at once
 */
export async function fillForm(
  page: Page,
  formData: Record<string, string | number>
) {
  for (const [label, value] of Object.entries(formData)) {
    await page.getByLabel(new RegExp(label, 'i')).fill(String(value));
  }
}

/**
 * Take screenshot with timestamp
 * Useful for debugging
 */
export async function takeScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({
    path: `test-results/screenshots/${name}-${timestamp}.png`,
    fullPage: true,
  });
}

/**
 * Check for console errors
 * Useful for catching JavaScript errors during tests
 */
export function setupConsoleErrorListener(page: Page) {
  const errors: string[] = [];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  return {
    getErrors: () => errors,
    expectNoErrors: () => {
      expect(errors).toHaveLength(0);
    },
  };
}

/**
 * Mock API response
 * Intercept and mock API calls in E2E tests
 */
export async function mockAPIResponse(
  page: Page,
  urlPattern: string | RegExp,
  responseData: unknown,
  status = 200
) {
  await page.route(urlPattern, async (route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(responseData),
    });
  });
}

/**
 * Wait for animation to complete
 * Useful when testing UI with animations
 */
export async function waitForAnimation(page: Page, ms = 500) {
  await page.waitForTimeout(ms);
}

/**
 * Clear local storage and cookies
 * Useful for test isolation
 */
export async function clearBrowserData(page: Page) {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}
