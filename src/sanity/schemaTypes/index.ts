import { type SchemaTypeDefinition } from 'sanity';

import { blockContentType } from './blockContentType';
import { categoryType } from './categoryType';
import { postType } from './postType';
import { authorType } from './authorType';
import { tagType } from './tagType';
import { instagramPost } from './instagramPost';
import { hr } from './hr';
import { featuredPostType } from './featuredPostType';
import { internalLinkType } from './internalLinkType';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    blockContentType,
    categoryType,
    postType,
    authorType,
    tagType,
    instagramPost,
    hr,
    featuredPostType,
    internalLinkType,
  ],
};
