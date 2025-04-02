import React from 'react';
import { highlightCode } from '@/lib/shiki';
import type { BundledLanguage } from 'shiki';

interface CodeBlockProps {
  code?: string;
  language?: BundledLanguage;
}

export default async function CodeBlock({ code, language }: CodeBlockProps) {
  if (!code) return null;

  const highlightedCode = await highlightCode(code, language);

  return (
    <div
      className="rounded-lg overflow-x-auto my-4 clear-both"
      dangerouslySetInnerHTML={{ __html: highlightedCode }}
    />
  );
}
