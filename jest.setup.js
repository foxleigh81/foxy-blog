import { mockPosts, mockAuthors, mockCategories, mockTags } from '@/mocks';

jest.mock('@/sanity/lib/client', () => ({
  sanityClient: {
    fetch: async (query) => {
      if (query.includes('_type == "post"')) {
        if (query.includes('slug.current ==')) {
          return mockPosts[0];
        }
        return mockPosts;
      }
      if (query.includes('_type == "author"')) {
        if (query.includes('slug.current ==')) {
          return mockAuthors[0];
        }
        return mockAuthors;
      }
      if (query.includes('_type == "category"')) {
        if (query.includes('slug.current ==')) {
          return mockCategories[0];
        }
        return mockCategories;
      }
      if (query.includes('_type == "tag"')) {
        if (query.includes('_id in')) {
          return mockTags;
        }
        return mockTags[0];
      }
      return [];
    },
  },
}));
