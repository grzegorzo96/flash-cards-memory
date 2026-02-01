import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * MSW server for Node.js environment (Vitest tests)
 * This server intercepts API requests during tests
 */
export const server = setupServer(...handlers);
