import { defineField } from 'sanity';

export const internalLinkType = defineField({
  name: 'internalLink',
  title: 'Internal link',
  type: 'object',
  fields: [
    {
      name: 'reference',
      type: 'reference',
      title: 'Reference',
      to: [{ type: 'post' }, { type: 'category' }, { type: 'author' }],
    },
  ],
});
