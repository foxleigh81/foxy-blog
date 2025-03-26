import { StructureResolver } from 'sanity/structure';
import { DocumentIcon, StarIcon, CogIcon } from '@sanity/icons';

export const structure: StructureResolver = (S) => {
  return S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Featured Post')
        .icon(StarIcon)
        .child(S.editor().schemaType('featuredPost').documentId('featured-post')),
      S.divider(),
      S.listItem()
        .title('Posts')
        .icon(DocumentIcon)
        .child(S.documentTypeList('post').title('Posts')),
      S.divider(),
      S.listItem()
        .title('Site Configuration')
        .icon(CogIcon)
        .child(
          S.list()
            .title('Site Configuration')
            .items([
              S.listItem()
                .title('Categories')
                .icon(DocumentIcon)
                .child(S.documentTypeList('category').title('Categories')),
              S.listItem()
                .title('Authors')
                .icon(DocumentIcon)
                .child(S.documentTypeList('author').title('Authors')),
              S.listItem()
                .title('Tags')
                .icon(DocumentIcon)
                .child(S.documentTypeList('tag').title('Tags')),
            ])
        ),
    ]);
};
