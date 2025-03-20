import Link from 'next/link';
import { Category } from '@/sanity/schemaTypes/categoryType';

interface BreadcrumbsProps {
  category: Category | null;
  postTitle: string;
}

export default function Breadcrumbs({ category, postTitle }: BreadcrumbsProps) {
  return (
    <nav className="container mx-auto text-sm mt-4" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link href="/" className="text-gray-700 hover:text-primary">
            Home
          </Link>
        </li>
        <li className="flex items-center space-x-2">
          <span className="text-gray-700">/</span>
          {category && (
            <Link 
              href={`/${category.slug.current}`} 
              className="text-gray-700 hover:text-primary"
            >
              {category.title}
            </Link>
          )}
        </li>
        <li className="flex items-center space-x-2">
          <span className="text-gray-500">/</span>
          <span className="text-gray-900 font-medium" aria-current="page">
            {postTitle}
          </span>
        </li>
      </ol>
    </nav>
  );
}
