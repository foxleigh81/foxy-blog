import type { Metadata } from 'next';
import { Righteous, Lato } from 'next/font/google';
import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from '@/contexts/AuthContext';
import Masthead from '@/components/Masthead';
import Footer from '@/components/Footer';
import CookieConsent from '@/components/CookieConsent';
import GTMScript from '@/components/GTMScript';
import SkipLink from '@/components/SkipLink';
import { sanityClient } from '@/sanity/lib/client';
import type { Category } from '@/sanity/schemaTypes/categoryType';

const primaryFont = Righteous({
  weight: '400',
  variable: '--font-primary',
  subsets: ['latin'],
});

const secondaryFont = Lato({
  weight: ['400', '700'],
  variable: '--font-secondary',
  subsets: ['latin'],
});

// Metadata for the root layout (applied to all pages)
export const metadata: Metadata = {
  title: "Foxy's Tale",
  description: 'The inane mutterings of Alexander Foxleigh',
  alternates: {
    types: {
      'application/rss+xml': '/rss-feed',
    },
  },
};

// Query to fetch all categories
const categoriesQuery = `*[_type == "category"] | order(title asc) {
  _id,
  title,
  slug
}`;

// Function to fetch all categories
async function getCategories() {
  const categories: Category[] = await sanityClient.fetch(categoriesQuery);
  return categories;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch categories for navigation
  const categories = await getCategories();
  const gtmId = process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID;

  if (!gtmId) {
    console.warn('GTM ID not found in environment variables');
  }

  return (
    <html lang="en">
      <head>{gtmId && <GTMScript gtmId={gtmId} />}</head>
      <body className={`${primaryFont.variable} ${secondaryFont.variable} antialiased`}>
        <AuthProvider>
          <SkipLink targetId="maincontent" />
          <Masthead
            categories={categories}
            title={metadata.title as string}
            subtitle={metadata.description as string}
          />
          <main id="maincontent" tabIndex={-1} className="container mx-auto px-4">
            {children}
          </main>
          <Footer />
          <Analytics />
          <CookieConsent />
          <Toaster position="bottom-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
