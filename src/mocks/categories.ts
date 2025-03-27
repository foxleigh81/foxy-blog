import { Category } from '@/sanity/schemaTypes/categoryType';

export const mockCategories: Category[] = [
  {
    _id: 'category-1',
    title: 'Test Category',
    slug: { current: 'test-category' },
    description: 'A test category for e2e testing',
  },
];
