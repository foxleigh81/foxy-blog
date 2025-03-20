"use client";

import React from 'react';
import Link from 'next/link';

interface NavigationProps {
  className?: string;
}

const Navigation: React.FC<NavigationProps> = ({ 
  className = ""
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
    <div className={`w-full ${className}`}>
      <div className="flex flex-col md:flex-row md:justify-end">
        {navLinks.map((link) => (
          <div key={link.path} className="my-2 md:my-0 md:ml-6">
            <Link 
              href={link.path} 
              className="text-white no-underline font-medium py-2 block md:inline-block hover:underline"
            >
              {link.name}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Navigation;
