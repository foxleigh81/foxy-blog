import React from 'react';
import { Post } from '@/sanity/schemaTypes/postType';
import { Category } from '@/sanity/schemaTypes/categoryType';
import PostCard from '../PostCard';

interface PostGridProps {
  posts: Post[];
  categories: Category[];
}

const PostGrid: React.FC<PostGridProps> = ({ posts, categories }) => {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No posts found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => {
        // Find the first category for this post - all posts have at least one category
        const firstCategoryRef = post.categories?.[0]?._ref;
        
        // Find the category object that matches the reference
        const firstCategory = categories.find(cat => cat._id === firstCategoryRef)!;
        
        // Generate the URL path for the post using the category slug and post slug
        const postUrl = `/${firstCategory.slug.current}/${post.slug.current}`;

        return (
          <PostCard 
            key={post._id || post.slug.current} 
            post={post} 
            category={firstCategory}
            postUrl={postUrl}
          />
        );
      })}
    </div>
  );
};

export default PostGrid;
