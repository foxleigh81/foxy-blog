import { test, expect } from './test-utils';
import type { Page } from '@playwright/test';

// Extend Page type to include our custom methods
interface CustomPage extends Page {
  navigateAndWait: (url: string) => Promise<void>;
  waitForPageLoad: () => Promise<void>;
  checkCommonPageElements: () => Promise<void>;
}

test.describe('Homepage', () => {
  test('displays content correctly', async ({ page }) => {
    await (page as CustomPage).navigateAndWait('/');

    // Check common elements
    await (page as CustomPage).checkCommonPageElements();

    // Check for main heading
    await page.waitForSelector('h1, h2', { timeout: 30000 });
    console.log('Found main heading');

    // Check for posts/articles
    try {
      // Try to find articles first (our preferred structure)
      await page.waitForSelector('article', { timeout: 15000 });
      console.log('Found article elements');
    } catch (error) {
      // If no articles, look for post cards or grid items
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

    // Check for post headings
    try {
      await page.waitForSelector('article h2, article h3', { timeout: 15000 });
      console.log('Found post headings inside articles');
    } catch (error) {
      console.log('No post headings inside articles, looking for alternatives:', error);
      try {
        await page.waitForSelector('h2, h3', { timeout: 15000 });
        console.log('Found alternative headings');
      } catch (secondError) {
        console.error('Failed to find any headings:', secondError);
        throw secondError;
      }
    }

    // Check for images
    try {
      await page.waitForSelector('img', { timeout: 30000 });
      console.log('Found images');
    } catch (error) {
      console.error('No images found:', error);
      throw error;
    }
  });

  test('navigation works correctly', async ({ page }) => {
    await (page as CustomPage).navigateAndWait('/');

    // Check common elements
    await (page as CustomPage).checkCommonPageElements();

    // Check that main navigation exists
    await page.waitForSelector('nav a', { timeout: 30000 });
    console.log('Found navigation links');

    // Find a navigation link (e.g. to a category)
    const navLinks = await page.$$('nav a');
    if (navLinks.length > 0) {
      // Get the href of the first nav link
      const href = await navLinks[0].getAttribute('href');
      console.log(`Found nav link with href: ${href}`);

      // Click the link
      await navLinks[0].click();
      console.log('Clicked navigation link');

      // Wait for navigation
      await (page as CustomPage).waitForPageLoad();

      // Check that we've navigated successfully
      if (href) {
        expect(page.url()).toContain(href);
        console.log(`Successfully navigated to URL containing: ${href}`);
      }
    }

    // Go back to home
    await (page as CustomPage).navigateAndWait('/');
    console.log('Navigated back to home');

    // Find an article link or any clickable element that might be a post
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

    // Get href
    const href = await articleLink.getAttribute('href');
    console.log(`Found post link with href: ${href}`);

    // Click the link
    await articleLink.click();
    console.log('Clicked post link');

    // Wait for navigation
    await (page as CustomPage).waitForPageLoad();

    // Check that we've navigated to an article page
    if (href) {
      expect(page.url()).toContain(href);
      console.log(`Successfully navigated to URL containing: ${href}`);
    }

    // Verify we're on an article page by checking for h1
    await page.waitForSelector('h1', { timeout: 30000 });
    console.log('Found h1 on post page');
  });
});
