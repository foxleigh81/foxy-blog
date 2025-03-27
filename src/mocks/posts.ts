import { Post } from '@/sanity/schemaTypes/postType';

export const mockPosts: Post[] = [
  {
    _id: '1',
    title: 'Test Post',
    subtitle: 'A test post for e2e testing',
    slug: { current: 'test-post' },
    author: {
      _ref: 'author-1',
      _type: 'reference',
    },
    mainImage: {
      asset: {
        _id: 'image-1',
        _type: 'sanity.imageAsset',
        metadata: {
          dimensions: { width: 800, height: 400 },
          lqip: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSAyVC08MTY3LjIyOUFTRjo/Tj4yMkhiSk46NjVBWkA6PkBAQEBAQEBAQED/2wBDAR0XFyAeIBogHh4gIiAoJCAoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
        },
      },
      alt: 'Test Post Image',
    },
    categories: [
      {
        _ref: 'category-1',
        _type: 'reference',
      },
    ],
    tags: [
      {
        _ref: 'tag-1',
        _type: 'reference',
      },
    ],
    publishedAt: '2024-03-20T00:00:00Z',
    body: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'This is a test post for e2e testing.',
          },
        ],
      },
    ],
    excerpt: 'A test post for e2e testing',
  },
];
