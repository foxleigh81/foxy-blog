'use client';

import React from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';

interface CodeBlockProps {
  code?: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  if (!code) return null;

  const highlightedCode = Prism.highlight(
    code,
    Prism.languages[language || 'plaintext'] || Prism.languages.plaintext,
    language || 'plaintext'
  );

  return (
    <pre className="bg-gray-900 text-gray-100 rounded-lg overflow-x-auto my-4 clear-both">
      <code
        className={`language-${language || 'plaintext'}`}
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
      />
    </pre>
  );
};

export default CodeBlock;
