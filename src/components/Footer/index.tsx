"use client";

import React from 'react';
import SocialLinks from '@/components/SocialLinks';

const Footer: React.FC = () => {
  return (
    <footer className="py-8 px-4 mt-8 border-t border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center mb-6">
          <p className="text-gray-600 mb-3">Follow me:</p>
          <SocialLinks className="justify-center" iconSize={24} />
        </div>
        
        <div className="text-center">
          <p className="m-0 mb-2 text-sm">© {new Date().getFullYear()}, Alexander Foxleigh</p>
          <p className="m-0">
            <a href="https://www.alexfoxleigh.com" className="text-black no-underline hover:underline text-sm">
              Built and maintained by Alex Foxleigh
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
