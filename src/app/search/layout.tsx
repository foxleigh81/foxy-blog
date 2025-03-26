import { Metadata } from 'next';
import { metadata as siteMetadata } from '../layout';

export const metadata: Metadata = {
  title: `Search | ${siteMetadata.title}`,
  description: 'Search for articles on the blog',
  robots: {
    index: false,
    follow: true,
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
