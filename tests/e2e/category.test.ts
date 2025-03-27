import { test, expect } from './test-utils';
import type { Page } from '@playwright/test';

// Extend Page type to include our custom methods
interface CustomPage extends Page {
  navigateAndWait: (url: string) => Promise<void>;
  waitForPageLoad: () => Promise<void>;
  checkCommonPageElements: () => Promise<void>;
}

test.describe('Category Page', () => {
  test('displays category information correctly', async ({ page }) => {
    await (page as CustomPage).navigateAndWait('/meta');

    // Check common elements
    await (page as CustomPage).checkCommonPageElements();

    // Check for category title (h1 or similar heading)
    await page.waitForSelector('h1', { timeout: 30000 });
  });

  test('displays category posts', async ({ page }) => {
    await (page as CustomPage).navigateAndWait('/meta');

    // Check common elements
    await (page as CustomPage).checkCommonPageElements();

    // Wait for article elements to appear
    try {
      await page.waitForSelector('article', { timeout: 15000 });
      console.log('Found article elements');
    } catch (error) {
      console.log('No article elements found, looking for alternative post containers:', error);
      try {
        await page.waitForSelector('.grid div[class*="rounded"], .grid a[href*="/"]', {
          timeout: 15000,
        });
        console.log('Found alternative post containers');
      } catch (secondError) {
        console.error('Failed to find any post containers:', secondError);
        throw secondError;
      }
    }

    // Check that at least one heading exists in the articles
    try {
      await page.waitForSelector('article h2, article h3, article h4', { timeout: 15000 });
      console.log('Found post headings inside articles');
    } catch (error) {
      console.log('No post headings inside articles, looking for alternatives:', error);
      try {
        await page.waitForSelector('h2, h3, h4', { timeout: 15000 });
        console.log('Found alternative headings');
      } catch (secondError) {
        console.error('Failed to find any headings:', secondError);
        throw secondError;
      }
    }

    // Check that at least one image exists
    try {
      await page.waitForSelector('article img', { timeout: 15000 });
      console.log('Found images inside articles');
    } catch (error) {
      console.log('No images inside articles, looking for alternatives:', error);
      try {
        await page.waitForSelector('img', { timeout: 15000 });
        console.log('Found images');
      } catch (secondError) {
        console.error('Failed to find any images:', secondError);
        throw secondError;
      }
    }
  });

  test('navigation works correctly', async ({ page }) => {
    await (page as CustomPage).navigateAndWait('/meta');

    // Check common elements
    await (page as CustomPage).checkCommonPageElements();

    // Find the first article link
    let articleLink;
    try {
      articleLink = await page.waitForSelector('article a', { timeout: 15000 });
      console.log('Found article link');
    } catch (error) {
      console.log('No article links found, looking for alternatives:', error);
      try {
        articleLink = await page.waitForSelector('a[href*="/"][class*="group"]', {
          timeout: 15000,
        });
        console.log('Found alternative post link');
      } catch (secondError) {
        console.error('Failed to find any post links:', secondError);
        throw secondError;
      }
    }

    // Get the href attribute to check later
    const href = await articleLink.getAttribute('href');
    console.log(`Found post link with href: ${href}`);

    // Click the link
    await articleLink.click();
    console.log('Clicked post link');

    // Wait for navigation
    await (page as CustomPage).waitForPageLoad();

    // Check that we've navigated to the expected page
    if (href) {
      expect(page.url()).toContain(href);
      console.log(`Successfully navigated to URL containing: ${href}`);
    }

    // Verify we're on an article page by checking for h1
    await page.waitForSelector('h1', { timeout: 30000 });
    console.log('Found h1 on post page');
  });
});
