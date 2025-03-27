import { Tag } from '@/sanity/schemaTypes/tagType';

export const mockTags: Tag[] = [
  {
    _id: 'tag-1',
    name: 'test-tag',
    color: {
      hex: '#FF0000',
      hsl: {
        h: 0,
        s: 100,
        l: 50,
        a: 1,
      },
      hsv: {
        h: 0,
        s: 100,
        v: 100,
        a: 1,
      },
      rgb: {
        r: 255,
        g: 0,
        b: 0,
        a: 1,
      },
      alpha: 1,
    },
  },
];
