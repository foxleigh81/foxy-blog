import { test, expect } from './test-utils';
import type { Page } from '@playwright/test';

// Extend Page type to include our custom methods
interface CustomPage extends Page {
  navigateAndWait: (url: string) => Promise<void>;
  waitForPageLoad: () => Promise<void>;
  checkCommonPageElements: () => Promise<void>;
}

test.describe('Post Pages', () => {
  test('MBS 2020 Goals post loads correctly', async ({ page }) => {
    // Go to the post with Instagram embeds
    await (page as CustomPage).navigateAndWait('/mind-body-and-soul/2020-goals-how-did-i-do');

    // Check common elements
    await (page as CustomPage).checkCommonPageElements();

    // Check article content
    await page.waitForSelector('h1', { timeout: 30000 });

    // Check that the article content is visible
    await page.waitForSelector('article', { timeout: 30000 });

    // Check author information (should be somewhere on the page)
    await page.waitForSelector('article img', { timeout: 30000 });
  });

  test('Meta "I\'m back baby" post loads correctly', async ({ page }) => {
    // Go to the post with images
    await (page as CustomPage).navigateAndWait('/meta/i-m-back-baby');

    // Check common elements
    await (page as CustomPage).checkCommonPageElements();

    // Check article content
    await page.waitForSelector('h1', { timeout: 30000 });

    // Check for images in article body
    await page.waitForSelector('article img', { timeout: 30000 });
  });

  test('Technically Minded VR post loads correctly', async ({ page }) => {
    // Go to the post with YouTube embeds
    await (page as CustomPage).navigateAndWait(
      '/technically-minded/what-should-we-expect-from-the-next-gen-of-vr'
    );

    // Check common elements
    await (page as CustomPage).checkCommonPageElements();

    // Check article content
    await page.waitForSelector('h1', { timeout: 30000 });

    // Check for YouTube embed container (might not be immediately visible)
    const hasYouTubeEmbed = await page.evaluate(() => {
      // Check in a more flexible way for YouTube content
      return document.body.innerHTML.includes('youtube') || !!document.querySelector('iframe');
    });

    expect(hasYouTubeEmbed).toBeTruthy();
  });
});
