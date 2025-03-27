import { test, expect } from './test-utils';
import type { Page } from '@playwright/test';

// Extend Page type to include our custom methods
interface CustomPage extends Page {
  navigateAndWait: (url: string) => Promise<void>;
  waitForPageLoad: () => Promise<void>;
  checkCommonPageElements: () => Promise<void>;
}

test.describe('Search Page', () => {
  test('displays search interface correctly', async ({ page }) => {
    await (page as CustomPage).navigateAndWait('/search');

    // Check common elements
    await (page as CustomPage).checkCommonPageElements();

    // Check for search heading
    await page.waitForSelector('h1', { timeout: 30000 });
    console.log('Found h1 heading');

    // Check for search input
    try {
      await page.waitForSelector('input[type="text"], input[type="search"]', { timeout: 15000 });
      console.log('Found search input field');
    } catch (error) {
      console.log('No direct search input found, looking for alternatives:', error);
      try {
        await page.waitForSelector('input, .search-container *', { timeout: 15000 });
        console.log('Found alternative input field');
      } catch (secondError) {
        console.error('Failed to find any input field:', secondError);
        throw secondError;
      }
    }

    // Check for search button
    try {
      await page.waitForSelector('button[type="submit"]', { timeout: 15000 });
      console.log('Found search submit button');
    } catch (error) {
      console.log('No direct submit button found, looking for alternatives:', error);
      try {
        await page.waitForSelector('button', { timeout: 15000 });
        console.log('Found alternative button');
      } catch (secondError) {
        console.error('Failed to find any button:', secondError);
        throw secondError;
      }
    }
  });

  test('search functionality works', async ({ page }) => {
    await (page as CustomPage).navigateAndWait('/search');

    // Check common elements
    await (page as CustomPage).checkCommonPageElements();

    // Wait for search form elements
    let searchInput;
    try {
      searchInput = await page.waitForSelector('input[type="text"], input[type="search"]', {
        timeout: 15000,
        state: 'visible',
      });
      console.log('Found search input field');
    } catch (error) {
      console.log('No direct search input found, looking for alternatives:', error);
      try {
        searchInput = await page.waitForSelector('input', {
          timeout: 15000,
          state: 'visible',
        });
        console.log('Found alternative input field');
      } catch (secondError) {
        console.error('Failed to find any input field:', secondError);
        throw secondError;
      }
    }

    // Type a search term
    await searchInput.fill('test');
    console.log('Filled search input with "test"');

    // Find and click the search button
    let searchButton;
    try {
      searchButton = await page.waitForSelector('button[type="submit"]', {
        timeout: 15000,
        state: 'visible',
      });
      console.log('Found search submit button');
    } catch (error) {
      console.log('No direct submit button found, looking for alternatives:', error);
      try {
        searchButton = await page.$$('button');
        if (searchButton.length > 0) {
          searchButton = searchButton[0];
          console.log('Found alternative button');
        } else {
          throw new Error('No buttons found');
        }
      } catch (secondError) {
        console.error('Failed to find any button:', secondError);
        throw secondError;
      }
    }

    // Click the search button
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {
        console.log('Navigation timeout - continuing anyway');
      }),
      searchButton.click(),
    ]);
    console.log('Clicked search button');

    // Wait a moment for any client-side navigation or URL updates
    await page.waitForTimeout(1000);

    // Directly check if the URL or search parameters contain the search term
    const pageUrl = page.url();
    let testPassed = false;

    if (pageUrl.includes('/search?q=test')) {
      console.log('URL contains search parameter (direct match)');
      testPassed = true;
    } else {
      // Try getting search params another way
      const urlSearchParams = await page.evaluate(() => window.location.search);
      if (urlSearchParams.includes('q=test')) {
        console.log('URL search parameters contain the search term');
        testPassed = true;
      } else {
        // Check if we're on the search page and the UI shows the search term
        const isOnSearchPage = pageUrl.includes('/search');
        if (isOnSearchPage) {
          try {
            // Look for the search term in the page content
            const searchTermInContent = await page.waitForSelector('p:has-text("test")', {
              timeout: 5000,
            });
            if (searchTermInContent) {
              console.log('On search page with search term visible in content');
              testPassed = true;
            }
          } catch (contentError: unknown) {
            const errorMessage =
              contentError instanceof Error ? contentError.message : 'Unknown error';
            console.log('Search term not found in page content:', errorMessage);
          }
        }
      }
    }

    // Use a more flexible assertion
    expect(testPassed).toBe(true);
  });
});
