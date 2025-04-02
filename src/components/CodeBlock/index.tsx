'use client';

import React, { useLayoutEffect, useState } from 'react';
import { codeToHtml } from 'shiki/bundle/web';
import type { BundledLanguage } from 'shiki/bundle/web';

interface CodeBlockProps {
  code: string;
  language?: BundledLanguage;
}

export default function CodeBlock({ code, language = 'typescript' }: CodeBlockProps) {
  const [highlightedCode, setHighlightedCode] = useState<string>('');

  useLayoutEffect(() => {
    const highlight = async () => {
      try {
        const html = await codeToHtml(code, {
          lang: language,
          theme: 'github-dark',
        });
        setHighlightedCode(html);
      } catch (error) {
        console.error('Error highlighting code:', error);
        setHighlightedCode(`<pre><code>${code}</code></pre>`);
      }
    };

    highlight();
  }, [code, language]);

  return (
    <>
      {highlightedCode ? (
        <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
      ) : (
        <pre
          className="text-gray-100 overflow-x-auto"
          style={{
            backgroundColor: '#24292e',
            fontSize: '0.888889em',
            lineHeight: '1.75',
            marginTop: '2em',
            marginBottom: '2em',
            borderRadius: '0.375rem',
            paddingTop: '1em',
            paddingInlineEnd: '1.5em',
            paddingBottom: '1em',
            paddingInlineStart: '1.5em',
          }}
        >
          <code>{code}</code>
        </pre>
      )}
    </>
  );
}
