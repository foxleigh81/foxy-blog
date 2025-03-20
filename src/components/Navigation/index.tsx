"use client";

import React from 'react';
import Link from 'next/link';
import type { Category } from '@/sanity/schemaTypes/categoryType';

interface NavigationProps {
  className?: string;
  categories: Category[];
}

const Navigation: React.FC<NavigationProps> = ({ 
  className = "",
  categories = []
}) => {
  // Create navigation links from categories
  const navLinks = [
    ...categories.map(category => ({
      name: category.title,
      path: `/${category.slug.current}`
    })).filter(category => category.name !== 'Meta')
  ];

  return (
    <div className={`${className}`}>
      <ul className="flex flex-col nav:flex-row items-center nav:items-stretch list-none p-0 m-0">
        {navLinks.map((link) => (
          <li key={link.path} className="nav:ml-6 w-full nav:w-auto">
            <Link 
              href={link.path} 
              className="text-white no-underline font-medium py-2 px-1 block hover:underline transition-all w-full text-center nav:text-left underline-offset-8 drop-shadow-md"
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Navigation;
