import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaClock } from 'react-icons/fa';
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
  readingTime?: number;
  mainImage?: {
    asset: {
      _id: string;
      _type: string;
      metadata: {
        dimensions: {
          width: number;
          height: number;
        };
        lqip: string;
      };
    };
    alt?: string;
    attribution?: string;
  };
  className?: string;
}

const BlogHeader: React.FC<BlogHeaderProps> = ({
  title,
  subtitle,
  publishedAt,
  author,
  categories,
  readingTime,
  mainImage,
  className = '',
}) => {
  return (
    <header className={className}>
      <h1 className="text-4xl font-bold mb-4">{title}</h1>
      {subtitle && <p className="text-xl text-gray-600 mb-4">{subtitle}</p>}

      <div className="flex flex-wrap items-center text-sm text-gray-600 mb-6">
        {publishedAt && (
          <time dateTime={publishedAt} className="mr-6">
            {formatDate(publishedAt)}
          </time>
        )}

        {readingTime && (
          <div className="flex items-center mr-6">
            <FaClock className="mr-1" />
            <span>{readingTime} min read</span>
          </div>
        )}

        {author && (
          <div className="flex items-center mr-6">
            <span>By </span>
            {author.slug?.current ? (
              <Link
                href={`/author/${author.slug.current}`}
                className="font-medium text-primary ml-1 underline underline-offset-4 hover:no-underline"
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
        <figure className="mb-8 relative aspect-square sm:aspect-[1510/450] w-full rounded-lg overflow-hidden">
          <Image
            src={urlFor(mainImage).width(1510).height(450).quality(80).url()}
            alt={mainImage.alt || title}
            fill
            priority
            className="object-cover object-top"
            sizes="(max-width: 1499px) 100vw, 1500px"
            placeholder="blur"
            blurDataURL={mainImage.asset.metadata?.lqip || ''}
          />
          {mainImage.attribution && (
            <div className="absolute bottom-1 right-1 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
              &copy; Copyright {mainImage.attribution}
            </div>
          )}
        </figure>
      )}
    </header>
  );
};

export default BlogHeader;
