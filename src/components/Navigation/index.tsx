"use client";

import React from 'react';
import Link from 'next/link';

interface NavigationProps {
  className?: string;
  isMobile?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ 
  className = "",
  isMobile = false
}) => {
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Technically Minded', path: '/technically-minded' },
    { name: 'Digital Industry', path: '/digital-industry' },
    { name: 'Meandering Insanity', path: '/meandering-insanity' },
    { name: 'Mind, Body and Soul', path: '/mind-body-and-soul' },
    { name: 'Scribblings', path: '/scribblings' }
  ];

  return (
    <ul className={`flex flex-col md:flex-row list-none p-0 m-0 md:justify-end md:items-center py-4 md:py-0 ${className}`}>
      {navLinks.map((link) => (
        <li 
          key={link.path}
          className={`${isMobile ? 'my-2 w-full' : 'md:my-0 md:ml-6 md:w-auto'}`}
        >
          <Link 
            href={link.path} 
            className="text-white no-underline font-medium py-2 block md:inline-block hover:underline"
          >
            {link.name}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default Navigation;
