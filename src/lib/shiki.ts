import type { BundledLanguage } from 'shiki';
import { codeToHtml } from 'shiki';

export async function highlightCode(code: string, language: BundledLanguage = 'typescript') {
  try {
    const highlighted = await codeToHtml(code, {
      lang: language,
      theme: 'github-dark',
    });
    return highlighted;
  } catch (error) {
    console.error(`Error highlighting code for language ${language}:`, error);
    return `<pre><code>${code}</code></pre>`;
  }
}
