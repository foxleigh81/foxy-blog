import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found | The Foxy Blog',
  description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
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
  );
}
