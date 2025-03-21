import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Author } from '@/sanity/schemaTypes/authorType';
import { Category } from '@/sanity/schemaTypes/categoryType';
import { urlFor } from '@/sanity/lib/image';
import { formatDate } from '@/utils/formatDate';
import { getCategoryColor, getCategoryTextColor } from '@/utils/categoryColors';

interface BlogHeaderProps {
  title: string;
  subtitle?: string;
  publishedAt?: string;
  author?: Author;
  categories?: Category[];
  mainImage?: {
    asset: {
      _ref: string;
      _type: "reference";
    };
    alt?: string;
  };
  className?: string;
}

const BlogHeader: React.FC<BlogHeaderProps> = ({ 
  title, 
  subtitle, 
  publishedAt, 
  author, 
  categories, 
  mainImage,
  className = "",
}) => {
  return (
    <header className={className}>
      <h1 className="text-4xl font-bold mb-4">{title}</h1>
      {subtitle && (
        <p className="text-xl text-gray-600 mb-4">{subtitle}</p>
      )}
      
      <div className="flex flex-wrap items-center text-sm text-gray-600 mb-6">
        {publishedAt && (
          <time dateTime={publishedAt} className="mr-6">
            {formatDate(publishedAt)}
          </time>
        )}
        
        {author && (
          <div className="flex items-center mr-6">
            <span>By </span>
            {author.slug?.current ? (
              <Link 
                href={`/author/${author.slug.current}`} 
                className="font-medium text-primary ml-1 hover:underline"
              >
                {author.name}
              </Link>
            ) : (
              <span className="font-medium text-primary ml-1">{author.name}</span>
            )}
          </div>
        )}
        
        {categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
            {categories.map((category) => (
              <Link 
                key={category._id} 
                href={`/${category.slug.current}`}
                className={`${getCategoryColor(category.slug.current)} ${getCategoryTextColor()} px-3 py-1 rounded-full text-xs font-medium`}
              >
                {category.title}
              </Link>
            ))}
          </div>
        )}
      </div>
      
      {mainImage?.asset && (
        <div className="relative w-full max-h-[450px] mb-4 rounded-lg overflow-hidden">
          <Image
            src={urlFor(mainImage).width(1200).height(450).url()}
            alt={mainImage.alt || title}
            width={1200}
            height={450}
            priority
            className="object-cover w-full h-auto max-h-[450px] object-top"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
          />
        </div>
      )}
    </header>
  );
};

export default BlogHeader;
