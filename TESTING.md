# FlashCardMemory - Testing Documentation

## Overview

This project implements a comprehensive testing strategy using:
- **Vitest** - Fast unit and integration testing
- **Playwright** - Reliable end-to-end testing
- **Testing Library** - React component testing
- **MSW** - API mocking

## Quick Start

```bash
# Run unit tests in watch mode
npm run test

# Run all unit tests once
npm run test:run

# Run E2E tests
npm run test:e2e

# Run tests with coverage
npm run test:coverage
```

## Project Structure

```
├── tests/                      # Unit and integration tests
│   ├── setup/                 # Test configuration
│   │   └── vitest.setup.ts   # Global test setup
│   ├── mocks/                # MSW handlers
│   │   ├── handlers.ts       # API mock handlers
│   │   └── server.ts         # MSW server setup
│   ├── fixtures/             # Test data
│   │   ├── user.fixtures.ts
│   │   └── deck.fixtures.ts
│   ├── helpers/              # Test utilities
│   │   └── render.tsx        # Custom render with providers
│   └── example.test.ts       # Example unit test
│
├── e2e/                       # End-to-end tests
│   ├── pages/                # Page Object Models
│   │   └── LoginPage.ts
│   ├── fixtures/             # E2E test data
│   │   └── auth.fixtures.ts
│   ├── components/           # Component objects
│   └── logout.spec.ts        # E2E test example
│
├── vitest.config.ts          # Vitest configuration
├── playwright.config.ts      # Playwright configuration
└── tsconfig.test.json        # TypeScript config for tests
```

## Unit Testing with Vitest

### Configuration

Vitest is configured in `vitest.config.ts`:
- Uses `jsdom` environment for DOM testing
- Global setup file at `tests/setup/vitest.setup.ts`
- Path aliases matching main project (`@/*`)
- Coverage reporting with v8

### Writing Unit Tests

#### Basic Test Structure

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  it('should do something specific', () => {
    // Arrange - Set up test data
    const input = 'test';
    
    // Act - Execute the code under test
    const result = doSomething(input);
    
    // Assert - Verify the outcome
    expect(result).toBe('expected');
  });
});
```

#### Testing React Components

```typescript
import { render, screen, fireEvent } from '@/tests/helpers/render';
import { vi } from 'vitest';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should handle user interaction', async () => {
    // Arrange
    const onClickMock = vi.fn();
    render(<MyComponent onClick={onClickMock} />);
    
    // Act
    const button = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(button);
    
    // Assert
    expect(onClickMock).toHaveBeenCalledOnce();
  });
});
```

#### Mocking Functions

```typescript
import { vi } from 'vitest';

// Mock entire module
vi.mock('@/lib/services/myService', () => ({
  myFunction: vi.fn().mockResolvedValue({ data: 'mocked' })
}));

// Spy on existing function
const spy = vi.spyOn(object, 'method');

// Mock implementation
const mockFn = vi.fn((x) => x * 2);
mockFn(5); // returns 10
expect(mockFn).toHaveBeenCalledWith(5);
```

#### Mocking API Calls with MSW

Add handlers to `tests/mocks/handlers.ts`:

```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  // GET request
  http.get('/api/decks', () => {
    return HttpResponse.json([
      { id: '1', name: 'Test Deck', description: 'A test deck' }
    ]);
  }),

  // POST request
  http.post('/api/decks', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      { id: '123', ...body },
      { status: 201 }
    );
  }),

  // Error response
  http.get('/api/decks/:deckId', () => {
    return HttpResponse.json(
      { error: 'Not found' },
      { status: 404 }
    );
  }),
];
```

### Test Utilities

#### Using Fixtures

```typescript
import { mockDeck, mockDecks } from '@/tests/fixtures/deck.fixtures';
import { mockUser } from '@/tests/fixtures/user.fixtures';

it('should display deck information', () => {
  render(<DeckCard deck={mockDeck} />);
  expect(screen.getByText(mockDeck.name)).toBeInTheDocument();
});
```

#### Custom Render Helper

The custom render helper in `tests/helpers/render.tsx` allows you to wrap components with providers:

```typescript
import { render } from '@/tests/helpers/render';

// Automatically wraps component with any global providers
render(<MyComponent />);
```

### Available Commands

```bash
# Watch mode - runs tests on file changes
npm run test

# Run once - for CI/CD
npm run test:run

# UI mode - interactive test explorer
npm run test:ui

# Coverage - generates coverage report
npm run test:coverage

# Filter tests by name
npm run test -- -t "should handle login"

# Run specific file
npm run test -- tests/components/LoginPage.test.tsx
```

## E2E Testing with Playwright

### Configuration

Playwright is configured in `playwright.config.ts`:
- Only Chromium browser (as per guidelines)
- Runs dev server automatically
- Captures traces on first retry
- Screenshots on failure
- Parallel execution enabled

### Page Object Model

Use POM pattern for maintainable tests. Create page objects in `e2e/pages/`:

```typescript
import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly createDeckButton: Locator;
  readonly decksList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createDeckButton = page.getByRole('button', { name: /create deck/i });
    this.decksList = page.getByRole('list', { name: /your decks/i });
  }

  async goto() {
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('networkidle');
  }

  async createDeck(name: string, description: string) {
    await this.createDeckButton.click();
    await this.page.getByLabel(/name/i).fill(name);
    await this.page.getByLabel(/description/i).fill(description);
    await this.page.getByRole('button', { name: /save|create/i }).click();
  }

  async getDeckByName(name: string) {
    return this.page.getByRole('listitem').filter({ hasText: name });
  }
}
```

### Writing E2E Tests

```typescript
import { test, expect } from '@playwright/test';
import { DashboardPage } from './pages/DashboardPage';

test.describe('Deck Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login or setup authentication
    // This might involve cookies, localStorage, etc.
  });

  test('user can create a new deck', async ({ page }) => {
    // Arrange
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();

    // Act
    await dashboardPage.createDeck('My Test Deck', 'Test description');

    // Assert
    const newDeck = dashboardPage.getDeckByName('My Test Deck');
    await expect(newDeck).toBeVisible();
  });

  test('user can delete a deck', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();

    const deck = dashboardPage.getDeckByName('My Test Deck');
    await deck.getByRole('button', { name: /delete/i }).click();
    
    await expect(deck).not.toBeVisible();
  });
});
```

### API Testing

Test backend APIs directly:

```typescript
test('API endpoint returns correct data', async ({ request }) => {
  const response = await request.get('/api/decks');
  
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  
  const data = await response.json();
  expect(data).toBeInstanceOf(Array);
  expect(data[0]).toHaveProperty('id');
  expect(data[0]).toHaveProperty('name');
});
```

### Visual Testing

Take and compare screenshots:

```typescript
test('homepage looks correct', async ({ page }) => {
  await page.goto('/');
  
  // First run creates baseline, subsequent runs compare
  await expect(page).toHaveScreenshot('homepage.png', {
    fullPage: true,
    // Allow small differences (optional)
    maxDiffPixels: 100,
  });
});
```

### Browser Context Isolation

Each test runs in isolated context:

```typescript
test('test with authentication', async ({ page, context }) => {
  // Set authentication state
  await context.addCookies([{
    name: 'auth_token',
    value: 'test-token',
    domain: 'localhost',
    path: '/',
  }]);

  await page.goto('/dashboard');
  // Test authenticated user experience
});
```

### Available Commands

```bash
# Run all E2E tests
npm run test:e2e

# Interactive UI mode
npm run test:e2e:ui

# Debug mode - step through tests
npm run test:e2e:debug

# Generate tests with code generator
npm run test:e2e:codegen

# Run specific test file
npx playwright test e2e/login.spec.ts

# Run tests in headed mode
npx playwright test --headed
```

## Best Practices

### Unit Tests

1. **Test behavior, not implementation**
   ```typescript
   // Good - tests user-facing behavior
   expect(screen.getByText('Welcome')).toBeInTheDocument();
   
   // Bad - tests implementation details
   expect(component.state.showWelcome).toBe(true);
   ```

2. **Use descriptive test names**
   ```typescript
   // Good
   it('should display error message when login fails')
   
   // Bad
   it('test login')
   ```

3. **Follow Arrange-Act-Assert pattern**
   ```typescript
   it('should calculate total correctly', () => {
     // Arrange
     const cart = { items: [{ price: 10 }, { price: 20 }] };
     
     // Act
     const total = calculateTotal(cart);
     
     // Assert
     expect(total).toBe(30);
   });
   ```

4. **Mock external dependencies**
   ```typescript
   vi.mock('@/lib/services/api', () => ({
     fetchData: vi.fn().mockResolvedValue({ data: 'mocked' })
   }));
   ```

5. **Use fixtures for consistent test data**
   ```typescript
   import { mockUser } from '@/tests/fixtures/user.fixtures';
   ```

### E2E Tests

1. **Use semantic locators**
   ```typescript
   // Good - resilient to DOM changes
   page.getByRole('button', { name: /submit/i })
   page.getByLabel('Email')
   page.getByText('Welcome back')
   
   // Bad - brittle selectors
   page.locator('.btn-primary')
   page.locator('#submit-btn')
   ```

2. **Implement Page Object Model**
   - Encapsulate page structure
   - Reuse common actions
   - Make tests more maintainable

3. **Wait for elements properly**
   ```typescript
   // Good
   await expect(page.getByText('Success')).toBeVisible();
   
   // Bad - arbitrary timeout
   await page.waitForTimeout(3000);
   ```

4. **Isolate tests**
   - Each test should be independent
   - Use beforeEach for common setup
   - Clean up test data in afterEach

5. **Test critical user journeys**
   - Authentication flow
   - Core features
   - Error scenarios

## Coverage

Generate coverage reports:

```bash
npm run test:coverage
```

Coverage reports are saved to `coverage/` directory. Open `coverage/index.html` in a browser to view detailed report.

### Coverage Thresholds

Configure in `vitest.config.ts`:

```typescript
coverage: {
  lines: 80,
  functions: 80,
  branches: 80,
  statements: 80,
}
```

## Debugging

### Unit Tests

1. Use `test.only()` to run single test:
   ```typescript
   it.only('should test this one', () => {
     // ...
   });
   ```

2. Use UI mode for visual debugging:
   ```bash
   npm run test:ui
   ```

3. Add console.log or debugger:
   ```typescript
   it('should debug this', () => {
     console.log('Debug value:', value);
     debugger; // Pauses execution
   });
   ```

### E2E Tests

1. **Debug mode** - step through tests:
   ```bash
   npm run test:e2e:debug
   ```

2. **Headed mode** - see browser:
   ```bash
   npx playwright test --headed
   ```

3. **Pause execution**:
   ```typescript
   await page.pause(); // Opens inspector
   ```

4. **View traces**:
   ```bash
   npx playwright show-trace test-results/trace.zip
   ```

5. **Take screenshots**:
   ```typescript
   await page.screenshot({ path: 'debug.png' });
   ```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:run
      - run: npm run test:coverage

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [MSW Documentation](https://mswjs.io/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Troubleshooting

### Common Issues

**Vitest: "Cannot find module '@/...'"**
- Check path aliases in `vitest.config.ts`
- Ensure `resolve.alias` matches `tsconfig.json` paths

**Playwright: "Timeout waiting for element"**
- Use proper waiting strategies
- Check if element exists with correct locator
- Increase timeout if needed: `{ timeout: 10000 }`

**MSW: Mocks not working**
- Check if handlers are registered in `tests/mocks/handlers.ts`
- Verify request URL matches exactly
- Check if MSW server is started in setup file

**Tests failing in CI but passing locally**
- Ensure consistent environment variables
- Check for timing issues (use proper waits)
- Verify dependencies are installed correctly

## Next Steps

1. Write tests for existing components
2. Add E2E tests for critical user journeys
3. Set up pre-commit hooks to run tests
4. Configure coverage thresholds
5. Integrate with CI/CD pipeline
