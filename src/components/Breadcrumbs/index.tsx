import Link from 'next/link';
import { Category } from '@/sanity/schemaTypes/categoryType';

interface BreadcrumbsProps {
  category?: Category | null;
  postTitle?: string;
  tagName?: string;
  isNotFound?: boolean;
}

export default function Breadcrumbs({ category, postTitle, tagName, isNotFound }: BreadcrumbsProps) {
  // Determine page type and content
  let currentPageTitle = '';
  let backUrl = '/';
  let backLabel = '';
  
  if (isNotFound) {
    currentPageTitle = 'Page Not Found';
    backUrl = '/';
    backLabel = 'Back to Home';
  } else if (tagName) {
    currentPageTitle = `#${tagName}`;
    backUrl = '/';
    backLabel = 'Back to Home';
  } else if (category && !postTitle) {
    // Category page
    currentPageTitle = category.title;
    backUrl = '/';
    backLabel = 'Back to Home';
  } else if (category && postTitle) {
    // Post page
    currentPageTitle = postTitle;
    backUrl = `/${category.slug.current}`;
    backLabel = `Back to ${category.title}`;
  }
  
  return (
    <nav className="container mx-auto text-sm mt-4" aria-label="Breadcrumb">
      {/* Mobile: Back link */}
      <div className="md:hidden">
        <Link 
          href={backUrl}
          className="flex items-center text-gray-700 hover:text-primary font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {backLabel}
        </Link>
      </div>
      
      {/* Desktop: Full breadcrumbs */}
      <ol className="hidden md:flex items-center">
        <li className="flex items-center">
          <Link href="/" className="text-gray-700 hover:text-primary">
            Home
          </Link>
          {(category || tagName || isNotFound) && <span className="text-gray-700 mx-2">/</span>}
        </li>
        
        {/* Category link (for post pages) */}
        {category && postTitle && (
          <li className="flex items-center">
            <Link 
              href={`/${category.slug.current}`} 
              className="text-gray-700 hover:text-primary"
            >
              {category.title}
            </Link>
            <span className="text-gray-700 mx-2">/</span>
          </li>
        )}
        
        {/* Tag prefix (for tag pages) */}
        {tagName && (
          <li className="flex items-center">
            <span className="text-gray-700">Tag</span>
            <span className="text-gray-700 mx-2">/</span>
          </li>
        )}
        
        {/* Current page */}
        <li>
          <span 
            className="text-gray-900 font-medium" 
            aria-current="page"
          >
            {currentPageTitle}
          </span>
        </li>
      </ol>
    </nav>
  );
}
