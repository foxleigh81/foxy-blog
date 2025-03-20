import type { Metadata } from "next";
import { Righteous, Lato } from "next/font/google";
import "./globals.css";

import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import { sanityClient } from "@/sanity/lib/client";
import type { Category } from "@/sanity/schemaTypes/categoryType";

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
  
  return (
    <html lang="en">
      <body className={`${primaryFont.variable} ${secondaryFont.variable} antialiased`}>
        <Masthead categories={categories} title={metadata.title as string} subtitle={metadata.description as string}/>
        {children}
        <Footer />
      </body>
    </html>
  );
}
