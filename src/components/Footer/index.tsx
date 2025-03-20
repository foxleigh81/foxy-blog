"use client";

import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-8 px-4 text-center mt-8 border-t border-gray-200">
      <div className="max-w-7xl mx-auto">
        <p className="m-0 mb-2">© {new Date().getFullYear()}, Alexander Foxleigh</p>
        <p className="m-0">
          <a href="https://www.alexfoxleigh.com" className="text-primary no-underline hover:underline">
            Built and maintained by Alex Foxleigh
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
