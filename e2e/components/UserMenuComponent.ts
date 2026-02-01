import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for User Menu Component
 * Represents the user information and logout section at the bottom of sidebar/mobile nav
 */
export class UserMenuComponent {
  readonly page: Page;
  readonly container: Locator;
  readonly userInfo: Locator;
  readonly userAvatar: Locator;
  readonly userEmail: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page, parent?: Locator) {
    this.page = page;
    const context = parent || page;
    this.container = context.getByTestId('user-menu');
    this.userInfo = context.getByTestId('user-info');
    this.userAvatar = context.getByTestId('user-avatar');
    this.userEmail = context.getByTestId('user-email');
    this.logoutButton = context.getByTestId('logout-button');
  }

  /**
   * Check if user menu is visible
   */
  async isVisible(): Promise<boolean> {
    return await this.container.isVisible();
  }

  /**
   * Get the displayed user email
   */
  async getUserEmail(): Promise<string> {
    return await this.userEmail.textContent() || '';
  }

  /**
   * Get the user initials from avatar
   */
  async getUserInitials(): Promise<string> {
    return await this.userAvatar.textContent() || '';
  }

  /**
   * Click the logout button
   * This will trigger form submission and redirect to landing page
   */
  async logout(): Promise<void> {
    await this.logoutButton.click();
  }

  /**
   * Verify user menu displays correct user information
   */
  async verifyUserInfo(expectedEmail: string): Promise<boolean> {
    const email = await this.getUserEmail();
    return email === expectedEmail;
  }
}
