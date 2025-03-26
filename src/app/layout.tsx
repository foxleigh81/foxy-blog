import type { Metadata } from "next";
import { Righteous, Lato } from "next/font/google";
import "./globals.css";
import Script from "next/script";

import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import { sanityClient } from "@/sanity/lib/client";
import type { Category } from "@/sanity/schemaTypes/categoryType";
import { Analytics } from "@vercel/analytics/react"

const primaryFont = Righteous({
  weight: "400",
  variable: "--font-primary",
  subsets: ["latin"],
});

const secondaryFont = Lato({
  weight: ["400", "700"],
  variable: "--font-secondary",
  subsets: ["latin"],
});

// Metadata for the root layout (applied to all pages)
export const metadata: Metadata = {
  title: "Foxy's Tale",
  description: "The inane mutterings of Alexander Foxleigh",
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
      <head>
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          crossOrigin="anonymous"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');`
          }}
        />
        <Script
          id="gtm-dataLayer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];`
          }}
        />
      </head>
      <body className={`${primaryFont.variable} ${secondaryFont.variable} antialiased`}>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
            loading="lazy"
          />
        </noscript>
        <Masthead categories={categories} title={metadata.title as string} subtitle={metadata.description as string}/>
        <main className="container mx-auto px-4">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
