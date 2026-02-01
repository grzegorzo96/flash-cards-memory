import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

/**
 * Custom render function that wraps components with necessary providers
 * Extend this function as needed when you add global providers (e.g., context, router)
 */
function render(ui: ReactElement, options?: RenderOptions) {
  return rtlRender(ui, {
    ...options,
    // Add wrapper for providers here if needed
    // wrapper: ({ children }) => <YourProvider>{children}</YourProvider>,
  });
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { render };
