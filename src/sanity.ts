import { createClient, type ClientConfig } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

import { env } from './environment';

if (!env.SANITY_PROJECT_ID || !env.SANITY_DATASET) {
  throw new Error('Missing Sanity environment variables');
}

const config: ClientConfig = {
  projectId: env.SANITY_PROJECT_ID,
  dataset: env.SANITY_DATASET,
  useCdn: true, // set to `false` to bypass the edge cache
  apiVersion: '2024-11-01' // use current date (YYYY-MM-DD) to target the latest API version
};

export const client = createClient(config);

// Helper function to build image URLs
export const imageBuilder = imageUrlBuilder(client);

export function urlForImage(source: any) {
  return imageBuilder.image(source).auto('format').fit('max');
}

// Define TypeScript interfaces for data
interface Category {
  name: string;
  slug: { current: string };
}

interface Post {
  title: string;
  slug: { current: string };
  category: { name: string; slug: { current: string } };
  hero?: string;
  heroAlt?: string;
  excerpt?: string;
  body?: any;
  publishedAt?: string;
  tags?: string[];
}

export async function getCategories(): Promise<Category[]> {
  try {
    const categories = await client.fetch(`*[_type == "category"]{name, slug}`);
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function getPosts(): Promise<Post[]> {
  try {
    const posts = await client.fetch(
      `*[_type == "post"]{
      _id, _type, _createdAt, _updatedAt, _rev, title, subtitle, slug, author, hero, heroAlt, category, tags, publishedAt, excerpt, body, relatedPosts, disableComments, unlisted
    }`
    );
    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export async function getPostsByCategory(category: string): Promise<{
  name: string;
  slug: { current: string };
  posts: Post[];
} | null> {
  try {
    const postsByCategory = await client.fetch(
      `*[_type == "category" && slug.current == $category][0] {
        name,
        slug,
        "posts": *[_type == "post" && category._ref == ^._id] {
          title,
          slug,
          category-> { name, slug },
          hero,
          heroAlt,
          excerpt
        }
      }`,
      { category }
    );
    return postsByCategory;
  } catch (error) {
    console.error('Error fetching posts by category:', error);
    return null;
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const post = await client.fetch(
      `*[_type == "post" && slug.current == $slug][0]{_id, _type, _createdAt, _updatedAt, _rev, title, subtitle, slug, author, hero, heroAlt, category, tags, publishedAt, excerpt, body, relatedPosts, disableComments, unlisted }`,
      { slug }
    );
    return post as Post;
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    return null;
  }
}
