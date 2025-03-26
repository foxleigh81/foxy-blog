import Link from 'next/link';
import { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import { metadata as siteMetadata } from './layout';

export const metadata: Metadata = {
  title: 'Page Not Found | ' + siteMetadata.title,
  description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
  return (
    <div className="container mx-auto px-4">
      <Breadcrumbs isNotFound={true} />

      <div className="py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-xl text-gray-600 mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block bg-primary text-white font-medium px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
