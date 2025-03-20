import React from 'react';

interface BlogHeaderProps {
  title: string;
  subtitle?: string;
}

const BlogHeader: React.FC<BlogHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="mb-10 text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-3">{title}</h1>
      {subtitle && (
        <p className="text-xl text-gray-600">{subtitle}</p>
      )}
    </div>
  );
};

export default BlogHeader;
