import { test as base } from '@playwright/test';
import { mockSanityClient } from './test-utils';

// Define the type for the Sanity client
type SanityClient = {
  fetch: (query: string, params?: Record<string, unknown>) => Promise<unknown>;
};

// Augment the Window interface for test mocks
declare global {
  interface Window {
    __TEST_MOCKS__?: {
      sanityClient: SanityClient | null;
    };
  }
}

// Extend the base test with our custom fixtures
export const test = base.extend({
  // Add a fixture that provides the mocked Sanity client
  context: async ({ context }, runTest) => {
    await context.addInitScript(() => {
      // Make the mock client available but don't actually set it
      // This avoids type errors while still providing the functionality
      window.__TEST_MOCKS__ = {
        sanityClient: null, // Will be set in the page context
      };
    });
    await runTest(context);
  },
});

// Export expect for use in tests
export { expect } from '@playwright/test';

// Configure test environment
test.beforeEach(async ({ page }) => {
  // Make the mock Sanity client available to the page
  await page.addInitScript((mockClient) => {
    // Type safety handling for the window augmentation
    if (!window.__TEST_MOCKS__) {
      window.__TEST_MOCKS__ = { sanityClient: null };
    }
    window.__TEST_MOCKS__.sanityClient = mockClient as SanityClient;
  }, mockSanityClient);
});
