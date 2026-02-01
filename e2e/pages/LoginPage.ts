import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for Login Page
 * Encapsulates page structure and interactions for maintainable tests
 */
export class LoginPage {
  readonly page: Page;
  readonly card: Locator;
  readonly form: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly togglePasswordButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.card = page.getByTestId('login-card');
    this.form = page.getByTestId('login-form');
    this.emailInput = page.getByTestId('email-input');
    this.passwordInput = page.getByTestId('password-input');
    this.submitButton = page.getByTestId('login-submit-button');
    this.togglePasswordButton = page.getByTestId('toggle-password-visibility');
    this.errorMessage = page.getByRole('alert');
  }

  /**
   * Navigate to login page
   */
  async goto() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Fill in login form and submit
   */
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  /**
   * Wait for navigation after successful login
   */
  async waitForNavigation() {
    await this.page.waitForURL('/dashboard', { timeout: 10000 });
  }

  /**
   * Check if login page is visible
   */
  async isVisible(): Promise<boolean> {
    return await this.card.isVisible();
  }

  /**
   * Toggle password visibility
   */
  async togglePasswordVisibility(): Promise<void> {
    await this.togglePasswordButton.click();
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string | null> {
    if (await this.errorMessage.isVisible()) {
      return await this.errorMessage.textContent();
    }
    return null;
  }
}
