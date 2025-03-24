import React from 'react';
import { Post } from '@/sanity/schemaTypes/postType';
import { Category } from '@/sanity/schemaTypes/categoryType';
import PostCard from '@/components/PostCard';

interface PostGridProps {
  posts: Post[];
  categories: Category[];
  includesFeatured?: boolean;
}

const PostGrid: React.FC<PostGridProps> = ({ posts, categories, includesFeatured = false }) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No posts to display.</p>
      </div>
    );
  }

  // Create a map of categories for quick lookup by id
  const categoryMap = categories.reduce((acc, category) => {
    acc[category._id] = category;
    return acc;
  }, {} as Record<string, Category>);

  // Find a default category to use as fallback
  const defaultCategory = categories.find(c => c.slug.current === 'uncategorized') ||
    categories.find(c => c.title.toLowerCase() === 'uncategorized') ||
    categories[0];

  if (!defaultCategory) {
    console.error('No categories available for posts');
  }

  // Get the category for a post
  const getPostCategory = (post: Post) => {
    const category = post.categories && post.categories[0] && categoryMap[post.categories[0]._ref]
      ? categoryMap[post.categories[0]._ref]
      : defaultCategory;

    if (!category) {
      console.warn(`No category found for post: ${post.title}`);
      return null;
    }

    return category;
  };

  // Get the post URL
  const getPostUrl = (post: Post, category: Category) => {
    return `/${category.slug.current}/${post.slug.current}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {posts.map((post, index) => {
        const category = getPostCategory(post);
        if (!category) return null;
        return (
          <PostCard
            key={post._id}
            post={post}
            category={category}
            postUrl={getPostUrl(post, category)}
            isFeatured={includesFeatured && index === 0}
          />
        );
      })}
    </div>
  );
};

export default PostGrid;
