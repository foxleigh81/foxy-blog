import React from 'react';
import BlockContent from '@/components/BlockContent';

interface BlogArticleProps {
  content: Array<{
    _type: 'block';
    children: Array<{
      _type: 'span';
      text: string;
      marks?: string[];
    }>;
  }>;
}

const BlogArticle: React.FC<BlogArticleProps> = ({ content }) => {
  return <BlockContent content={content} />;
};

export default BlogArticle;
