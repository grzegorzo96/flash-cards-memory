# Page Object Model (POM) Documentation

## Overview

This directory contains Page Object Model classes for E2E testing with Playwright. The POM pattern encapsulates page structure and interactions, making tests more maintainable and reusable.

## Structure

```
e2e/
├── components/           # Reusable component classes
│   ├── SidebarComponent.ts
│   ├── MobileNavComponent.ts
│   ├── UserMenuComponent.ts
│   └── index.ts
├── pages/               # Full page classes
│   ├── LoginPage.ts
│   ├── LandingPage.ts
│   └── index.ts
├── fixtures/            # Test data and helpers
│   └── auth.fixtures.ts
└── logout.spec.ts       # Example test using POM
```

## Components

### SidebarComponent

Represents the desktop sidebar navigation (fixed left sidebar).

**Location:** Desktop only (hidden on mobile)

**Locators:**
- `container` - Main sidebar container (`data-testid="sidebar"`)
- `userMenu` - User menu component at the bottom

**Methods:**
```typescript
await sidebar.isVisible()                    // Check if sidebar is visible
await sidebar.navigateTo('Dashboard')        // Navigate using nav items
await sidebar.isNavItemActive('Dashboard')   // Check if nav item is active
await sidebar.logout()                       // Logout via user menu
```

**Example:**
```typescript
const sidebar = new SidebarComponent(page);
await expect(sidebar.container).toBeVisible();
await sidebar.navigateTo('Decks');
await sidebar.logout();
```

---

### MobileNavComponent

Represents the mobile navigation (top bar with slide-out menu).

**Location:** Mobile only (visible on viewport < 1024px)

**Locators:**
- `container` - Mobile nav container (`data-testid="mobile-nav"`)
- `menuTrigger` - Hamburger menu button (`data-testid="mobile-menu-trigger"`)
- `sidebar` - Slide-out menu panel (`data-testid="mobile-sidebar"`)
- `userMenu` - User menu component

**Methods:**
```typescript
await mobileNav.isVisible()                  // Check if mobile nav is visible
await mobileNav.openMenu()                   // Open slide-out menu
await mobileNav.closeMenu()                  // Close slide-out menu (ESC)
await mobileNav.isMenuOpen()                 // Check if menu is open
await mobileNav.navigateTo('Study')          // Navigate from mobile menu
await mobileNav.logout()                     // Logout from mobile menu
```

**Example:**
```typescript
const mobileNav = new MobileNavComponent(page);
await mobileNav.openMenu();
await expect(mobileNav.sidebar).toBeVisible();
await mobileNav.logout();
```

---

### UserMenuComponent

Represents the user information and logout section (shared by Sidebar and MobileNav).

**Location:** Bottom of sidebar (desktop) and mobile slide-out menu

**Locators:**
- `container` - User menu container (`data-testid="user-menu"`)
- `userInfo` - User information section (`data-testid="user-info"`)
- `userAvatar` - Avatar with initials (`data-testid="user-avatar"`)
- `userEmail` - User email display (`data-testid="user-email"`)
- `logoutButton` - Logout button (`data-testid="logout-button"`)

**Methods:**
```typescript
await userMenu.isVisible()                   // Check if user menu is visible
await userMenu.getUserEmail()                // Get displayed email
await userMenu.getUserInitials()             // Get avatar initials
await userMenu.logout()                      // Click logout button
await userMenu.verifyUserInfo(email)         // Verify email matches
```

**Example:**
```typescript
const userMenu = new UserMenuComponent(page);
await expect(userMenu.container).toBeVisible();
const email = await userMenu.getUserEmail();
expect(email).toBe('test@example.com');
await userMenu.logout();
```

---

## Pages

### LandingPage

Represents the public home page (shown to guests and after logout).

**URL:** `/`

**Locators:**
- `container` - Main page container (`data-testid="landing-page"`)
- `mainContent` - Main content area (`data-testid="landing-main"`)
- `navigation` - Top navigation bar (`data-testid="navigation"`)
- `appTitle` - Application title (`data-testid="app-title"`)
- `loginLink` - Login link button (`data-testid="login-link"`)
- `registerLink` - Register link button (`data-testid="register-link"`)

**Methods:**
```typescript
await landingPage.goto()                     // Navigate to landing page
await landingPage.isVisible()                // Check if page is visible
await landingPage.isOnLandingPage()          // Check URL is '/'
await landingPage.isGuestNavigationVisible() // Check login/register visible
await landingPage.goToLogin()                // Click login link
await landingPage.goToRegister()             // Click register link
await landingPage.waitForLoad()              // Wait for full page load
await landingPage.getAppTitle()              // Get app title text
```

**Example:**
```typescript
const landingPage = new LandingPage(page);
await page.waitForURL('/');
await expect(landingPage.container).toBeVisible();
expect(await landingPage.isGuestNavigationVisible()).toBe(true);
await landingPage.goToLogin();
```

---

### LoginPage

Represents the login page.

**URL:** `/login`

**Locators:**
- `emailInput` - Email input field
- `passwordInput` - Password input field
- `submitButton` - Login submit button
- `errorMessage` - Error message alert

**Methods:**
```typescript
await loginPage.goto()                       // Navigate to login page
await loginPage.login(email, password)       // Fill and submit login form
await loginPage.waitForNavigation()          // Wait for redirect after login
```

**Example:**
```typescript
const loginPage = new LoginPage(page);
await loginPage.goto();
await loginPage.login('test@example.com', 'password123');
await loginPage.waitForNavigation();
```

---

## Usage Examples

### Basic Logout Test (Desktop)

```typescript
import { test, expect } from '@playwright/test';
import { SidebarComponent } from './components';
import { LandingPage } from './pages';
import { loginAsUser, testUsers } from './fixtures/auth.fixtures';

test('should logout from desktop sidebar', async ({ page }) => {
  // Setup: Login first
  await loginAsUser(page, testUsers.validUser);
  await page.goto('/dashboard');

  // Initialize POM
  const sidebar = new SidebarComponent(page);
  const landingPage = new LandingPage(page);

  // Action: Logout
  await sidebar.logout();

  // Assert: Verify redirect to landing page
  await page.waitForURL('/');
  await expect(landingPage.container).toBeVisible();
  expect(await landingPage.isGuestNavigationVisible()).toBe(true);
});
```

### Mobile Logout Test

```typescript
test('should logout from mobile menu', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  
  // Setup: Login and navigate
  await loginAsUser(page, testUsers.validUser);
  await page.goto('/dashboard');

  // Initialize POM
  const mobileNav = new MobileNavComponent(page);
  const landingPage = new LandingPage(page);

  // Action: Open menu and logout
  await mobileNav.openMenu();
  await expect(mobileNav.sidebar).toBeVisible();
  await mobileNav.logout();

  // Assert: Verify logout successful
  await page.waitForURL('/');
  await expect(landingPage.container).toBeVisible();
});
```

### User Info Verification Test

```typescript
test('should display user information correctly', async ({ page }) => {
  const testUser = testUsers.validUser;
  await loginAsUser(page, testUser);
  await page.goto('/dashboard');

  const sidebar = new SidebarComponent(page);
  
  // Verify user menu shows correct information
  const displayedEmail = await sidebar.userMenu.getUserEmail();
  expect(displayedEmail).toBe(testUser.email);
  
  const initials = await sidebar.userMenu.getUserInitials();
  expect(initials).toBeTruthy();
  expect(initials.length).toBeGreaterThanOrEqual(1);
});
```

---

## Best Practices

### 1. Use Composition

Components can contain other components (e.g., SidebarComponent contains UserMenuComponent):

```typescript
export class SidebarComponent {
  readonly userMenu: UserMenuComponent;
  
  constructor(page: Page) {
    this.userMenu = new UserMenuComponent(page);
  }
}

// Usage
await sidebar.userMenu.logout();
```

### 2. Return Types

Methods should return meaningful values:
- `async isVisible(): Promise<boolean>` - for checks
- `async getUserEmail(): Promise<string>` - for retrieving data
- `async logout(): Promise<void>` - for actions

### 3. Wait Strategies

Include waits in methods when appropriate:

```typescript
async openMenu(): Promise<void> {
  await this.menuTrigger.click();
  await this.sidebar.waitFor({ state: 'visible' }); // Wait for animation
}
```

### 4. Descriptive Method Names

Use clear, action-oriented names:
- ✅ `logout()`, `navigateTo()`, `isVisible()`
- ❌ `click()`, `check()`, `get()`

### 5. Data Test IDs

Always use `data-testid` for reliable selectors:

```typescript
this.container = page.getByTestId('sidebar');        // ✅ Reliable
// Avoid: page.locator('.sidebar-container');        // ❌ Fragile
```

### 6. Reusability

Keep components focused and reusable:
- **Components** - reusable UI parts (Sidebar, UserMenu)
- **Pages** - complete page representations (LandingPage, LoginPage)

---

## Testing Checklist

When creating new POM classes:

- [ ] Use TypeScript with proper types
- [ ] Initialize all locators in constructor
- [ ] Use `data-testid` selectors
- [ ] Add JSDoc comments for classes and methods
- [ ] Include wait strategies where needed
- [ ] Return meaningful types (boolean, string, void)
- [ ] Follow naming conventions (isVisible, getUserEmail)
- [ ] Compose complex components from simpler ones
- [ ] Export from index.ts files
- [ ] Create example test demonstrating usage

---

## Running Tests

```bash
# Run all tests
npm run test:e2e

# Run specific test file
npx playwright test e2e/logout.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Run in debug mode
npx playwright test --debug

# Run specific test by name
npx playwright test -g "should logout from desktop sidebar"
```

---

## Maintenance

When updating UI:

1. Update `data-testid` attributes in components
2. Update corresponding POM locators
3. Run tests to verify
4. Update documentation if needed

This ensures tests remain stable even when UI implementation changes.
