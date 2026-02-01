import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for Landing Page
 * Represents the public home page shown to guest users (after logout or first visit)
 */
export class LandingPage {
  readonly page: Page;
  readonly container: Locator;
  readonly mainContent: Locator;
  readonly navigation: Locator;
  readonly appTitle: Locator;
  readonly navigationActions: Locator;
  readonly loginLink: Locator;
  readonly registerLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByTestId('landing-page');
    this.mainContent = page.getByTestId('landing-main');
    this.navigation = page.getByTestId('navigation');
    this.appTitle = page.getByTestId('app-title');
    this.navigationActions = page.getByTestId('navigation-actions');
    this.loginLink = page.getByTestId('login-link');
    this.registerLink = page.getByTestId('register-link');
  }

  /**
   * Navigate to the landing page
   */
  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  /**
   * Check if landing page is visible
   */
  async isVisible(): Promise<boolean> {
    return await this.container.isVisible();
  }

  /**
   * Check if user is on landing page by URL
   */
  async isOnLandingPage(): Promise<boolean> {
    return this.page.url().endsWith('/');
  }

  /**
   * Verify guest navigation is displayed (login/register buttons)
   */
  async isGuestNavigationVisible(): Promise<boolean> {
    const loginVisible = await this.loginLink.isVisible();
    const registerVisible = await this.registerLink.isVisible();
    return loginVisible && registerVisible;
  }

  /**
   * Navigate to login page
   */
  async goToLogin(): Promise<void> {
    await this.loginLink.click();
  }

  /**
   * Navigate to register page
   */
  async goToRegister(): Promise<void> {
    await this.registerLink.click();
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForLoad(): Promise<void> {
    await this.container.waitFor({ state: 'visible' });
    await this.mainContent.waitFor({ state: 'visible' });
  }

  /**
   * Get the application title text
   */
  async getAppTitle(): Promise<string> {
    return await this.appTitle.textContent() || '';
  }
}
