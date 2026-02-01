# Testing Guide

This project uses **Vitest** for unit and integration tests, and **Playwright** for end-to-end (E2E) tests.

## Unit Tests (Vitest)

### Current Test Suite

The project includes **133 unit tests** covering core business logic and critical utilities:

| Module | Tests | Status |
|--------|-------|--------|
| FSRS (Spaced Repetition) | 27 | ✅ |
| Language Detector | 46 | ✅ |
| OpenRouter Errors | 38 | ✅ |
| Preview Cards Store | 22 | ✅ |

📖 **Detailed documentation:** [README-UNIT-TESTS.md](./README-UNIT-TESTS.md)

### Running Tests

```bash
# Run tests in watch mode (development)
npm run test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- tests/example.test.ts

# Run all unit tests for lib modules
npm run test -- --run tests/lib/

# Run tests matching pattern
npm run test -- -t "should handle async"
```

### Writing Unit Tests

1. Create test files with `.test.ts` or `.spec.ts` extension
2. Use the Arrange-Act-Assert pattern
3. Leverage Vitest's mocking capabilities with `vi` object
4. Use custom render helper from `tests/helpers/render.tsx` for React components

Example:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/tests/helpers/render';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    // Arrange
    const props = { title: 'Test' };
    
    // Act
    render(<MyComponent {...props} />);
    
    // Assert
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

### Mocking API Calls

Use MSW (Mock Service Worker) to mock API calls:

1. Add handlers to `tests/mocks/handlers.ts`
2. MSW server is automatically configured in `tests/setup/vitest.setup.ts`

Example:

```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/decks', () => {
    return HttpResponse.json([
      { id: '1', name: 'Test Deck' }
    ]);
  }),
];
```

### Test Fixtures

Use fixtures from `tests/fixtures/` for consistent test data:

```typescript
import { mockDeck, mockDecks } from '@/tests/fixtures/deck.fixtures';
import { mockUser } from '@/tests/fixtures/user.fixtures';
```

## E2E Tests (Playwright)

### Running E2E Tests

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug

# Generate tests with codegen
npm run test:e2e:codegen
```

### Writing E2E Tests

1. Create test files in `e2e/` directory with `.spec.ts` extension
2. Use Page Object Model pattern (see `e2e/pages/`)
3. Use browser contexts for test isolation
4. Leverage Playwright's powerful locators

Example:

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test('user can login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password123');
  
  await expect(page).toHaveURL('/dashboard');
});
```

### Page Object Model

Create page objects in `e2e/pages/` to encapsulate page structure:

```typescript
export class DashboardPage {
  readonly page: Page;
  readonly decksList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.decksList = page.getByRole('list', { name: /decks/i });
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async createDeck(name: string) {
    await this.page.getByRole('button', { name: /create/i }).click();
    await this.page.getByLabel(/name/i).fill(name);
    await this.page.getByRole('button', { name: /save/i }).click();
  }
}
```

## Best Practices

### Unit Tests
- Keep tests focused and isolated
- Use descriptive test names
- Mock external dependencies
- Test edge cases and error conditions
- Use `beforeEach` for common setup
- Prefer `toBeInTheDocument()` over `toBeTruthy()` for DOM elements

### E2E Tests
- Use Page Object Model for maintainability
- Wait for elements properly (avoid arbitrary timeouts)
- Use semantic locators (role, label, text)
- Test critical user journeys
- Keep tests independent
- Clean up test data after tests

## Coverage

Run tests with coverage to ensure code quality:

```bash
npm run test:coverage
```

Coverage reports are generated in `coverage/` directory.

## Debugging

### Unit Tests
- Use `test.only()` to run a single test
- Use `console.log()` or debugger statements
- Run tests with `--reporter=verbose` for detailed output

### E2E Tests
- Use `--debug` flag to step through tests
- Use trace viewer for debugging failures
- Take screenshots on failure (configured by default)
- Use `page.pause()` to pause execution

## CI/CD

Tests run automatically in CI pipeline:
- Unit tests run on every push
- E2E tests run on pull requests
- Coverage reports are generated and uploaded

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [MSW Documentation](https://mswjs.io/)
