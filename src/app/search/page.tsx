'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { sanityClient } from '@/sanity/lib/client';
import { groq } from 'next-sanity';
import type { Post } from '@/sanity/schemaTypes/postType';
import type { Category } from '@/sanity/schemaTypes/categoryType';
import Breadcrumbs from '@/components/Breadcrumbs';
import PostGrid from '@/components/PostGrid';
import Pagination from '@/components/Pagination';
import { paginateItems } from '@/utils/pagination';

interface TagRefData {
  _id: string;
  name: string;
  slug: string;
  color: string;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const page = searchParams.get('page') ? parseInt(searchParams.get('page') || '1', 10) : 1;
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [redirectedToTag, setRedirectedToTag] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(page);
  const [searchTerm, setSearchTerm] = useState(query);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Use the full URL path to ensure query parameters are properly added
      const searchUrl = `/search?q=${encodeURIComponent(searchTerm.trim())}`;
      router.push(searchUrl);

      // For tests - apply the query parameter immediately to the URL
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('q', searchTerm.trim());
        window.history.pushState({}, '', url.toString());
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Define the search function first so it can be called from anywhere in the effect
    async function fetchSearchResults() {
      if (!isMounted) return;
      setIsLoading(true);

      try {
        // Remove any hashtags from the search term for better matching
        const cleanQuery = query.replace(/#/g, '');

        // Fetch all tags first to help with search
        const allTagsQuery = groq`
          *[_type == "tag"] {
            _id,
            name,
            "slug": slug.current,
            color
          }
        `;
        const allTags = await sanityClient.fetch<TagRefData[]>(allTagsQuery);

        if (!isMounted) return;

        // Find tags that might match our search term
        const matchingTagIds = allTags
          .filter(
            (tag) =>
              tag.name?.toLowerCase().includes(cleanQuery.toLowerCase()) ||
              false ||
              tag.slug?.toLowerCase().includes(cleanQuery.toLowerCase()) ||
              false
          )
          .map((tag) => tag._id);

        // GROQ query for searching posts - explicitly defining which fields to search
        const searchQuery = groq`*[_type == "post" && !unlisted && (
          title match ("*" + $searchTerm + "*") ||
          excerpt match ("*" + $searchTerm + "*") ||
          pt::text(body) match ("*" + $searchTerm + "*") ||
          count(tags[_ref in $matchingTagIds]) > 0
        )] | order(publishedAt desc) {
          _id,
          title,
          slug,
          publishedAt,
          excerpt,
          mainImage {
            asset->{
              _id,
              _type,
              metadata {
                lqip
              }
            },
            alt
          },
          categories,
          tags
        }`;

        if (!isMounted) return;

        const fetchedPosts = await sanityClient.fetch<Post[]>(searchQuery, {
          searchTerm: cleanQuery,
          matchingTagIds,
        });

        // Fetch all categories for reference
        const categoriesQuery = groq`*[_type == "category"] {
          _id,
          title,
          slug,
          description
        }`;

        const fetchedCategories = await sanityClient.fetch<Category[]>(categoriesQuery);

        // Client-side filtering as a backup
        const filteredPosts = fetchedPosts.filter((post) => {
          const searchTermLower = cleanQuery.toLowerCase();

          // Check if the post directly matches the search term in these fields
          const titleMatch = post.title?.toLowerCase().includes(searchTermLower);
          const excerptMatch = post.excerpt?.toLowerCase().includes(searchTermLower);

          // Check if any of the post's tags match the search term
          const tagsMatch = post.tags?.some((tagRef) => {
            const matchingTag = allTags.find((t) => t._id === tagRef._ref);
            if (!matchingTag) return false;

            return (
              matchingTag.name?.toLowerCase().includes(searchTermLower) ||
              false ||
              matchingTag.slug?.toLowerCase().includes(searchTermLower) ||
              false
            );
          });

          const result = titleMatch || excerptMatch || tagsMatch;
          return result;
        });

        // Filtered posts ready for pagination

        // Paginate the posts
        const pageSize = 9; // Number of posts per page
        const { items: paginatedPosts, totalPages: pages } = paginateItems(filteredPosts, {
          page: page.toString(),
          pageSize: pageSize.toString(),
        });

        setPosts(paginatedPosts);
        setTotalPages(pages);
        setCurrentPage(page);
        setCategories(fetchedCategories);
      } catch (error) {
        if (!isMounted) return;
        console.error('Error fetching search results:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    // Check if this is a hashtag search
    const hashtagMatch = query.match(/^#([\w-]+)$/);

    if (hashtagMatch && !redirectedToTag) {
      // It's a hashtag search, check if the tag exists
      const tagSlug = hashtagMatch[1];

      // Check if the tag exists
      async function checkTagExists() {
        try {
          const tagQuery = groq`count(*[_type == "tag" && slug.current == "${tagSlug}"]) > 0`;
          const tagExists = await sanityClient.fetch<boolean>(tagQuery);

          if (tagExists) {
            // Tag exists, redirect to tag page
            setRedirectedToTag(true);
            router.push(`/tag/${tagSlug}`);
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

    return () => {
      isMounted = false;
    };
  }, [query, redirectedToTag, router, page]);

  return (
    <main className="container mx-auto px-4">
      <Breadcrumbs />

      <div className="mt-4">
        <h1 className="text-3xl font-bold mb-4">Search Results</h1>

        <div className="mb-8">
          <form onSubmit={handleSubmit} className="flex mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for articles..."
              className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Search"
            />
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-r-md transition-colors"
              aria-label="Submit search"
            >
              Search
            </button>
          </form>
        </div>

        {query ? (
          <p className="text-xl text-gray-600 mb-8">
            {isLoading
              ? 'Searching...'
              : posts.length > 0
                ? `Found ${posts.length} result${posts.length === 1 ? '' : 's'} for "${query}"`
                : `No results found for "${query}"`}
          </p>
        ) : (
          <p className="text-xl text-gray-600 mb-8">Please enter a search term</p>
        )}
      </div>

      {posts.length > 0 && (
        <>
          <PostGrid posts={posts} categories={categories} />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath="/search"
            searchParams={{
              q: query,
              ...Object.fromEntries(
                Array.from(searchParams.entries()).filter(([key]) => key !== 'page' && key !== 'q')
              ),
            }}
          />
        </>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
