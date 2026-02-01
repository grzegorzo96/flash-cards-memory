import { Page, Locator } from '@playwright/test';
import { UserMenuComponent } from './UserMenuComponent';

/**
 * Page Object Model for Desktop Sidebar Component
 * Represents the fixed left sidebar navigation (visible on desktop)
 */
export class SidebarComponent {
  readonly page: Page;
  readonly container: Locator;
  readonly userMenu: UserMenuComponent;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByTestId('sidebar');
    this.userMenu = new UserMenuComponent(page, this.container);
  }

  /**
   * Check if sidebar is visible (desktop layout)
   */
  async isVisible(): Promise<boolean> {
    return await this.container.isVisible();
  }

  /**
   * Navigate to a specific section using nav items
   */
  async navigateTo(label: string): Promise<void> {
    await this.container.getByRole('link', { name: label }).click();
  }

  /**
   * Get all navigation items
   */
  getNavItems(): Locator {
    return this.container.getByRole('link');
  }

  /**
   * Check if a specific navigation item is active
   */
  async isNavItemActive(label: string): Promise<boolean> {
    const navItem = this.container.getByRole('link', { name: label });
    const ariaCurrent = await navItem.getAttribute('aria-current');
    return ariaCurrent === 'page';
  }

  /**
   * Logout via user menu in sidebar
   */
  async logout(): Promise<void> {
    await this.userMenu.logout();
  }
}
