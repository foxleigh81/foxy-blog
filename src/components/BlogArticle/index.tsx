import React from 'react';
import BlockContent from '@/components/BlockContent';
import { BlockContent as BlockContentType } from '@/sanity/schemaTypes/blockContentType';

interface BlogArticleProps {
  content: BlockContentType;
}

const BlogArticle: React.FC<BlogArticleProps> = ({ content }) => {
  return <BlockContent content={content} />;
};

export default BlogArticle;
