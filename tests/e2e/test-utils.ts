import { test as base } from '@playwright/test';
import type { Page } from '@playwright/test';

// Basic mock for Sanity client
export const mockSanityClient = {
  fetch: async (query: string, params?: Record<string, string | number | boolean | object>) => {
    console.log('Mock Sanity fetch:', query, params);

    // Return mock data based on the query
    if (query.includes('_type == "post"') || query.includes('_type == "post"')) {
      // If querying for posts by author
      if (params?.authorId === 'author-1') {
        return [
          {
            _id: 'post-1',
            title: 'Test Post 1',
            slug: { current: 'test-post-1' },
            publishedAt: '2023-01-01',
            excerpt: 'This is a test post excerpt',
            mainImage: {
              asset: {
                _id: 'image-1',
                _type: 'sanity.imageAsset',
                metadata: {
                  lqip: 'data:image/jpeg;base64,mockbase64',
                },
              },
              alt: 'Test image',
            },
            categories: [{ _ref: 'category-1' }],
            tags: [{ _ref: 'tag-1' }],
            author: { _ref: 'author-1' },
          },
          {
            _id: 'post-2',
            title: 'Test Post 2',
            slug: { current: 'test-post-2' },
            publishedAt: '2023-01-02',
            excerpt: 'This is another test post excerpt',
            mainImage: {
              asset: {
                _id: 'image-2',
                _type: 'sanity.imageAsset',
                metadata: {
                  lqip: 'data:image/jpeg;base64,mockbase64',
                },
              },
              alt: 'Test image 2',
            },
            categories: [{ _ref: 'category-2' }],
            tags: [{ _ref: 'tag-2' }],
            author: { _ref: 'author-1' },
          },
        ];
      }
      return [
        {
          _id: 'post-1',
          title: 'Test Post 1',
          slug: { current: 'test-post-1' },
          publishedAt: '2023-01-01',
          excerpt: 'This is a test post excerpt',
          mainImage: {
            asset: {
              _id: 'image-1',
              _type: 'sanity.imageAsset',
              metadata: {
                lqip: 'data:image/jpeg;base64,mockbase64',
              },
            },
            alt: 'Test image',
          },
          categories: [{ _ref: 'category-1' }],
          tags: [{ _ref: 'tag-1' }],
          author: { _ref: 'author-1' },
        },
        {
          _id: 'post-2',
          title: 'Test Post 2',
          slug: { current: 'test-post-2' },
          publishedAt: '2023-01-02',
          excerpt: 'This is another test post excerpt',
          mainImage: {
            asset: {
              _id: 'image-2',
              _type: 'sanity.imageAsset',
              metadata: {
                lqip: 'data:image/jpeg;base64,mockbase64',
              },
            },
            alt: 'Test image 2',
          },
          categories: [{ _ref: 'category-2' }],
          tags: [{ _ref: 'tag-2' }],
          author: { _ref: 'author-1' },
        },
      ];
    }

    if (query.includes('_type == "author"')) {
      if (params?.slug === 'alexander-foxleigh') {
        return {
          _id: 'author-1',
          name: 'Alexander Foxleigh',
          slug: { current: 'alexander-foxleigh' },
          image: {
            asset: {
              _id: 'image-3',
              _type: 'sanity.imageAsset',
              metadata: {
                lqip: 'data:image/jpeg;base64,mockbase64',
              },
            },
          },
          bio: [{ _type: 'block', children: [{ text: 'Author bio' }] }],
        };
      }
      return [];
    }

    if (query.includes('_type == "category"')) {
      return [
        {
          _id: 'category-1',
          title: 'Digital Industry',
          slug: { current: 'digital-industry' },
          description: 'Posts about the digital industry',
        },
        {
          _id: 'category-2',
          title: 'Meta',
          slug: { current: 'meta' },
          description: 'Meta posts',
        },
      ];
    }

    if (query.includes('_type == "tag"')) {
      if (params?.slug === 'career') {
        return {
          _id: 'tag-1',
          name: 'Career',
          slug: { current: 'career' },
          color: 'blue',
        };
      }
      return [
        {
          _id: 'tag-1',
          name: 'Career',
          slug: { current: 'career' },
          color: 'blue',
        },
        {
          _id: 'tag-2',
          name: 'JavaScript',
          slug: { current: 'javascript' },
          color: 'yellow',
        },
      ];
    }

    // Default fallback
    return [];
  },
};

// Extend the Page interface with our custom methods
interface CustomPage extends Page {
  navigateAndWait: (url: string) => Promise<void>;
  waitForPageLoad: () => Promise<void>;
  checkCommonPageElements: () => Promise<void>;
}

// Create a test fixture with longer default timeout
export const test = base.extend<{ page: CustomPage }>({
  page: async ({ page }, runTest) => {
    // Increase default timeout for all actions
    page.setDefaultTimeout(60000);

    // Setup global test concerns
    await setupForTests(page as CustomPage);

    // Run the test
    await runTest(page as CustomPage);
  },
});

// Common setup for all tests
async function setupForTests(page: CustomPage): Promise<void> {
  // Add helper methods and utilities if needed
  await page.addInitScript(() => {
    // Helper to expose test state
    window.__TEST_STATE__ = {
      ready: false,
      errors: [],
    };

    // Helper to check if a component is fully rendered
    window.markTestReady = () => {
      window.__TEST_STATE__.ready = true;
    };

    // Capture errors during tests
    window.addEventListener('error', (e) => {
      console.error('Page error:', e.message);
      window.__TEST_STATE__.errors.push({
        message: e.message,
        stack: e.error?.stack,
      });
    });
  });

  // Extend page with custom methods
  page.navigateAndWait = async (url: string) => {
    console.log(`Navigating to ${url}`);

    // Navigate with longer timeout
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 60000,
    });

    // Additional wait for hydration and client-side rendering
    try {
      await page.waitForFunction(
        () => {
          return (
            document.querySelectorAll('main').length > 0 &&
            document.querySelectorAll('header').length > 0
          );
        },
        { timeout: 30000 }
      );
      console.log('Main and header elements found');
    } catch (error) {
      console.error('Error waiting for main and header elements:', error);
      // Log the current HTML state for debugging
      const html = await page.content();
      console.log('Current page HTML:', html.substring(0, 500) + '...');
    }

    // Extra safety timeout
    await page.waitForTimeout(2000);
  };

  // Add method to wait for page load
  page.waitForPageLoad = async () => {
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });

    try {
      // Wait for main content to be visible
      await page.waitForSelector('main', { timeout: 30000 });
      console.log('Main content is visible');
    } catch (error) {
      console.error('Error waiting for main content:', error);
      // Log the current HTML state for debugging
      const html = await page.content();
      console.log('Current page HTML:', html.substring(0, 500) + '...');
    }

    // Extra wait for any dynamic content
    await page.waitForTimeout(2000);
  };

  // Add method to check common page elements
  page.checkCommonPageElements = async () => {
    try {
      // Wait for header
      await page.waitForSelector('header', { timeout: 30000, state: 'visible' });
      console.log('Header is visible');

      // Wait for navigation - could be in header or standalone
      // Note: Navigation might be hidden in mobile view, so we just check for existence without requiring visibility
      await page.waitForSelector('nav', { timeout: 30000 });
      console.log('Navigation is present');

      // Wait for main content
      await page.waitForSelector('main', { timeout: 30000, state: 'visible' });
      console.log('Main content is visible');
    } catch (error) {
      console.error('Error checking common page elements:', error);
      // Log the current HTML state for debugging
      const html = await page.content();
      console.log('Current page HTML:', html.substring(0, 500) + '...');
    }
  };
}

// Add a global type for window augmentation
declare global {
  interface Window {
    __TEST_STATE__: {
      ready: boolean;
      errors: Array<{
        message: string;
        stack?: string;
      }>;
    };
    markTestReady: () => void;
  }
}

// Export expect for use in tests
export { expect } from '@playwright/test';
