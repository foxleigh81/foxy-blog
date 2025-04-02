import React from 'react';
import Image from 'next/image';
import { Category } from '@/sanity/schemaTypes/categoryType';
import { RelatedPost } from '@/types/post';
import { urlFor } from '@/sanity/lib/image';

interface RelatedPostsProps {
  posts: RelatedPost[];
  categories: Category[];
}

const RelatedPosts: React.FC<RelatedPostsProps> = ({ posts, categories }) => {
  if (!posts || posts.length === 0) return null;

  return (
    <div className="mt-8 lg:mt-0">
      <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
      <div className="grid grid-cols-1 gap-6">
        {posts.map((relatedPost) => {
          // Find the first category for this post
          const firstCategoryRef = relatedPost.categories?.[0]?._ref;
          const firstCategory = categories.find((cat) => cat._id === firstCategoryRef);
          const postUrl = firstCategory
            ? `/${firstCategory.slug.current}/${relatedPost.slug.current}`
            : `/post/${relatedPost.slug.current}`;

          return (
            <article
              key={relatedPost._id}
              className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col"
            >
              <a href={postUrl} className="block group">
                <div className="relative h-60">
                  {relatedPost.mainImage?.asset ? (
                    <>
                      <Image
                        src={urlFor(relatedPost.mainImage).width(400).height(240).url()}
                        alt={relatedPost.mainImage.alt || relatedPost.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 500px"
                        placeholder="blur"
                        blurDataURL={relatedPost.mainImage.asset.metadata?.lqip || ''}
                        quality={75}
                      />
                    </>
                  ) : (
                    <div className="h-full bg-gray-800 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>
                <div className="p-4 flex-grow">
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                    {relatedPost.title}
                  </h3>
                  {relatedPost.excerpt && (
                    <p className="text-gray-600 text-sm line-clamp-5">{relatedPost.excerpt}</p>
                  )}
                </div>
              </a>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default RelatedPosts;
