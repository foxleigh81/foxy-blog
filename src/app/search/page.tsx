"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { sanityClient } from '@/sanity/lib/client';
import type { Post } from '@/sanity/schemaTypes/postType';
import type { Category } from '@/sanity/schemaTypes/categoryType';
import Breadcrumbs from '@/components/Breadcrumbs';
import PostGrid from '@/components/PostGrid';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [redirectedToTag, setRedirectedToTag] = useState(false);

  useEffect(() => {
    // Define the search function first so it can be called from anywhere in the effect
    async function fetchSearchResults() {
      setIsLoading(true);
      
      try {
        // Fetch posts that match the search query
        // Remove any hashtags from the search term for better matching
        const cleanQuery = query.replace(/#/g, '');
        
        // GROQ query for searching posts - explicitly defining which fields to search
        // Only searching in title, excerpt, body text, and tags
        // For tags, we check if any tag contains our search term
        const searchQuery = `*[_type == "post" && !unlisted && (
          title match $searchTerm || 
          excerpt match $searchTerm || 
          pt::text(body) match $searchTerm ||
          count(tags[@ match $tagSearchTerm]) > 0
        )] | order(publishedAt desc) {
          _id,
          title,
          slug,
          publishedAt,
          excerpt,
          mainImage,
          categories,
          tags
        }`;
        
        const fetchedPosts = await sanityClient.fetch<Post[]>(searchQuery, { 
          searchTerm: `*${cleanQuery}*`,
          tagSearchTerm: `*${cleanQuery}*`
        });
        
        // Fetch all categories for reference
        const categoriesQuery = `*[_type == "category"] {
          _id,
          title,
          slug,
          description
        }`;
        
        const fetchedCategories = await sanityClient.fetch<Category[]>(categoriesQuery);
        
        // For debugging purposes, log the posts and search term
        console.log('Search term:', cleanQuery);
        console.log('Fetched posts:', fetchedPosts.map(p => ({ title: p.title, tags: p.tags })));
        
        // Client-side filtering as a backup to ensure posts actually match the search term
        // This helps exclude posts that might be included due to references in relatedPosts
        const filteredPosts = fetchedPosts.filter(post => {
          if (!post.tags) {
            // If no tags, just check title and excerpt
            return post.title?.toLowerCase().includes(cleanQuery.toLowerCase()) ||
                   post.excerpt?.toLowerCase().includes(cleanQuery.toLowerCase());
          }
          
          const searchTermLower = cleanQuery.toLowerCase();
          
          // Check if the post directly matches the search term in these fields
          const titleMatch = post.title?.toLowerCase().includes(searchTermLower);
          const excerptMatch = post.excerpt?.toLowerCase().includes(searchTermLower);
          
          // Special handling for tags - check both with and without hashtag
          const tagsMatch = post.tags.some(tag => {
            const tagLower = tag.toLowerCase();
            // Log each tag comparison for debugging
            console.log(`Comparing tag: '${tagLower}' with search: '${searchTermLower}'`);
            console.log(`- Exact match: ${tagLower === searchTermLower}`);
            console.log(`- Tag includes search: ${tagLower.includes(searchTermLower)}`);
            console.log(`- Search includes tag: ${searchTermLower.includes(tagLower)}`);
            
            return tagLower === searchTermLower || // Exact match
                   tagLower.includes(searchTermLower) || // Tag contains search term
                   searchTermLower.includes(tagLower); // Search term contains tag
          });
          
          // We can't easily check body content client-side as it's a complex structure
          // But the three checks above should cover most cases
          const result = titleMatch || excerptMatch || tagsMatch;
          console.log(`Post '${post.title}' matches: ${result} (title: ${titleMatch}, excerpt: ${excerptMatch}, tags: ${tagsMatch})`);
          
          return result;
        });
        
        setPosts(filteredPosts);
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    // Check if this is a hashtag search
    const hashtagMatch = query.match(/^#([\w-]+)$/);
    
    if (hashtagMatch && !redirectedToTag) {
      // It's a hashtag search, check if the tag exists
      const tag = hashtagMatch[1];
      
      // Check if the tag exists in any posts
      async function checkTagExists() {
        try {
          const tagQuery = `count(*[_type == "post" && "${tag}" in tags]) > 0`;
          const tagExists = await sanityClient.fetch<boolean>(tagQuery);
          
          if (tagExists) {
            // Tag exists, redirect to tag page
            setRedirectedToTag(true);
            router.push(`/tag/${tag}`);
          } else {
            // Tag doesn't exist, just do a normal search
            fetchSearchResults();
          }
        } catch (error) {
          console.error('Error checking if tag exists:', error);
          // On error, fall back to normal search
          fetchSearchResults();
        }
      }
      
      checkTagExists();
    } else if (query) {
      // Normal search
      fetchSearchResults();
    } else {
      // Empty query
      setPosts([]);
      setIsLoading(false);
    }
  }, [query, redirectedToTag, router]);

  return (
    <main className="container mx-auto px-4">
      <Breadcrumbs />
      
      <div className="mt-4">
        <h1 className="text-3xl font-bold mb-4">Search Results</h1>
        {query ? (
          <p className="text-xl text-gray-600 mb-8">
            {isLoading 
              ? 'Searching...' 
              : posts.length > 0 
                ? `Found ${posts.length} result${posts.length === 1 ? '' : 's'} for "${query}"` 
                : `No results found for "${query}"`
            }
          </p>
        ) : (
          <p className="text-xl text-gray-600 mb-8">
            Please enter a search term
          </p>
        )}
      </div>
      
      {posts.length > 0 && (
        <PostGrid posts={posts} categories={categories} />
      )}
    </main>
  );
}
