export type RelatedPost = {
  _id: string;
  title: string;
  subtitle?: string;
  slug: {
    current: string;
  };
  mainImage?: {
    asset: {
      _ref: string;
      _type: 'reference';
      metadata: {
        dimensions: {
          width: number;
          height: number;
        };
      };
    };
    alt?: string;
  };
  excerpt?: string;
  categories?: Array<{
    _ref: string;
    _type: string;
  }>;
  publishedAt?: string;
};
