import { groq } from 'next-sanity';

export const rssFeedQuery = groq`
  *[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    subtitle,
    "slug": slug.current,
    "author": author->name,
    publishedAt,
    excerpt,
    "categories": categories[]->title,
    "mainImage": mainImage.asset->url
  }
`;
