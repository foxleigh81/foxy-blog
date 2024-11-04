import { createClient, type ClientConfig } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

import { env } from './environment';

const config: ClientConfig = {
  projectId: env.SANITY_PROJECT_ID,
  dataset: env.SANITY_DATASET,
  useCdn: true, // set to `false` to bypass the edge cache
  apiVersion: '2024-11-01' // use current date (YYYY-MM-DD) to target the latest API version
};

export const client = createClient(config);

// helper function to build image URLs
export const imageBuilder = imageUrlBuilder(client);

// uses GROQ to query content: https://www.sanity.io/docs/groq
export async function getCategories() {
  const categories = await client.fetch('*[_type == "category"]');
  return categories;
}

export async function getPosts() {
  const posts = await client.fetch(
    '*[_type == "post"]{..., category->{slug}, hero, heroAlt, excerpt, slug}'
  );
  return posts;
}

export async function getPostsByCategory(category: string) {
  const posts = await client.fetch(`
    *[_type == "category" && slug.current == "${category}"][0] {
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
    }
  `);
  return posts;
}

export async function getPostBySlug(slug: string) {
  const post = await client.fetch(`
    *[_type == "post" && slug.current == "${slug}"][0] {
      title,
      subtitle,
      slug,
      publishedAt,
      tags,
      category-> { name, slug },
      hero,
      heroAlt,
      excerpt,
      body
    }
  `);
  return post;
}
