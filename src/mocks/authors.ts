import { Author } from '@/sanity/schemaTypes/authorType';

export const mockAuthors: Author[] = [
  {
    _id: 'author-1',
    name: 'Test Author',
    slug: { current: 'test-author' },
    image: {
      asset: {
        _ref: 'image-2',
        _type: 'reference',
      },
    },
    bio: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'This is a test author bio.',
          },
        ],
      },
    ],
  },
];
