"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Post } from '@/sanity/schemaTypes/postType';
import { Category } from '@/sanity/schemaTypes/categoryType';
import { urlFor } from '@/sanity/lib/image';
import { formatDate } from '@/utils/formatDate';
import { getCategoryColor, getCategoryTextColor } from '@/utils/categoryColors';

interface PostCardProps {
  post: Post;
  category: Category;
  postUrl: string;
}

const PostCard: React.FC<PostCardProps> = ({ post, category, postUrl }) => {
  // Get the category color and text color based on the category slug
  const categoryColor = getCategoryColor(category.slug.current);
  const categoryTextColor = getCategoryTextColor(category.slug.current);

  return (
    <Link href={postUrl} className="block group">
      <div className="rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl bg-white h-full flex flex-col">
        <div className="relative">
          {post.mainImage?.asset ? (
            <div className="relative h-48 w-full">
              <Image
                src={urlFor(post.mainImage).width(500).height(300).url()}
                alt={post.mainImage.alt || post.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {post.publishedAt && (
                <div className="absolute top-0 right-0 bg-black/70 text-white text-xs font-medium px-2 py-1 m-2 rounded">
                  {formatDate(post.publishedAt)}
                </div>
              )}
            </div>
          ) : (
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>
        
        <div className="p-4 flex-grow">
          <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-200">
            {post.title}
          </h2>
          <p className="text-gray-600 text-sm line-clamp-3">
            {post.excerpt}
          </p>
        </div>
        
        <div className={`${categoryColor} ${categoryTextColor} px-4 py-2 text-sm font-medium`}>
          {category.title}
        </div>
      </div>
    </Link>
  );
};

export default PostCard;
