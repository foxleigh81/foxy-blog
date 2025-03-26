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
  isFeatured?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, category, postUrl, isFeatured = false }) => {
  // Get the category color and text color based on the category slug
  const categoryColor = getCategoryColor(category.slug.current);
  const categoryTextColor = getCategoryTextColor();

  // Calculate image dimensions based on featured status
  const imageWidth = isFeatured ? 800 : 500;
  const imageHeight = isFeatured ? 400 : 300;

  // Generate image URL with proper dimensions
  const imageUrl = post.mainImage?.asset
    ? urlFor(post.mainImage)
        .width(imageWidth)
        .height(imageHeight)
        .fit('crop')
        .crop('entropy')
        .url()
    : '';

  return (
    <Link
      href={postUrl}
      className={`block group h-full ${isFeatured ? 'lg:col-span-2' : ''}`}
    >
      <div className="rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl bg-white h-full flex flex-col transform group-hover:scale-105">
        <div className="relative h-60">
          {post.mainImage?.asset ? (
            <>
              <Image
                src={imageUrl}
                alt={post.mainImage.alt || post.title}
                fill
                className="object-cover"
                priority={isFeatured}
                sizes={isFeatured
                  ? "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1000px"
                  : "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 500px"}
                quality={isFeatured ? 90 : 75}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"></div>
            </>
          ) : (
            <div className="h-full bg-gray-800 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h2 className="font-headers text-2xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {post.title}
            </h2>

            {post.publishedAt && (
              <div className="text-white/80 text-xs font-medium mt-2">
                {formatDate(post.publishedAt)}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 flex-grow">
          <p className="font-body text-gray-600 text-m line-clamp-3">
            {post.excerpt}
          </p>
        </div>

        <div className={`${categoryColor} ${categoryTextColor} px-4 py-2 text-sm font-medium mt-auto`}>
          {category.title}
        </div>
      </div>
    </Link>
  );
};

export default PostCard;
