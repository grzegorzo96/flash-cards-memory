import { Page, Locator } from '@playwright/test';
import { UserMenuComponent } from './UserMenuComponent';

/**
 * Page Object Model for Mobile Navigation Component
 * Represents the mobile top bar and slide-out navigation menu
 */
export class MobileNavComponent {
  readonly page: Page;
  readonly container: Locator;
  readonly menuTrigger: Locator;
  readonly sidebar: Locator;
  readonly userMenu: UserMenuComponent;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByTestId('mobile-nav');
    this.menuTrigger = page.getByTestId('mobile-menu-trigger');
    this.sidebar = page.getByTestId('mobile-sidebar');
    this.userMenu = new UserMenuComponent(page, this.sidebar);
  }

  /**
   * Check if mobile navigation is visible (mobile layout)
   */
  async isVisible(): Promise<boolean> {
    return await this.container.isVisible();
  }

  /**
   * Open the mobile navigation sidebar
   */
  async openMenu(): Promise<void> {
    await this.menuTrigger.click();
    await this.sidebar.waitFor({ state: 'visible' });
  }

  /**
   * Close the mobile navigation sidebar
   */
  async closeMenu(): Promise<void> {
    // Click outside or use close mechanism
    await this.page.keyboard.press('Escape');
    await this.sidebar.waitFor({ state: 'hidden' });
  }

  /**
   * Check if mobile sidebar menu is open
   */
  async isMenuOpen(): Promise<boolean> {
    return await this.sidebar.isVisible();
  }

  /**
   * Navigate to a specific section from mobile menu
   */
  async navigateTo(label: string): Promise<void> {
    await this.openMenu();
    await this.sidebar.getByRole('link', { name: label }).click();
  }

  /**
   * Logout via user menu in mobile sidebar
   */
  async logout(): Promise<void> {
    await this.openMenu();
    await this.userMenu.logout();
  }
}
