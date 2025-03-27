export type RelatedPost = {
  _id: string;
  title: string;
  subtitle?: string;
  slug: {
    current: string;
  };
  mainImage?: {
    asset: {
      _id: string;
      _type: string;
      metadata: {
        dimensions: {
          width: number;
          height: number;
        };
        lqip: string;
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
