"use client";

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Search from '@/components/Search';
import type { Category } from '@/sanity/schemaTypes/categoryType';
import Link from 'next/link';
import Image from 'next/image';
import styles from './masthead.module.css';

interface MastheadProps {
  title: string,
  subtitle: string,
  categories: Category[];
}

const Masthead: React.FC<MastheadProps> = ({ title, subtitle, categories }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className={`w-full text-white py-8 mb-8 relative ${styles.masthead} ${menuOpen ? styles.menuOpen : ''}`}>
      <div className="container mx-auto relative z-10">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex-1 min-w-[200px] flex items-center gap-4">
            <Image src="/alex-foxleigh.jpg" alt="Alex Foxleigh" width={70} height={70} className="rounded-full border-2 border-white drop-shadow-md ml-4" />
            <div className="flex flex-col">
              <Link href="/"><h1 className="text-4xl md:text-5xl font-bold text-white m-0 font-headers drop-shadow-md">{title}</h1></Link>
              <p className="text-sm md:text-m font-body font-bold text-white/80 mt-1 drop-shadow-md">{subtitle}</p>
            </div>
          </div>
          
          <div className="hidden nav:flex items-center">
            <Navigation categories={categories} className="justify-end" />
            <Search mobileMenuOpen={false} />
          </div>
          
          <button 
            className="nav:hidden p-2 bg-transparent border-0 cursor-pointer z-10 ml-2"
            onClick={toggleMenu}
            aria-expanded={menuOpen}
            aria-controls="navigation"
          >
            <span className="block relative w-6 h-6">
              <span className={`block absolute h-0.5 w-full bg-white rounded transition-all duration-300 ease-in-out ${menuOpen ? 'opacity-0' : 'opacity-100'} top-1/2 -translate-y-1/2`}></span>
              <span className={`block absolute h-0.5 w-full bg-white rounded transition-all duration-300 ease-in-out ${menuOpen ? 'rotate-45 top-1/2 -translate-y-1/2' : 'top-0'}`}></span>
              <span className={`block absolute h-0.5 w-full bg-white rounded transition-all duration-300 ease-in-out ${menuOpen ? '-rotate-45 top-1/2 -translate-y-1/2' : 'bottom-0'}`}></span>
            </span>
            <span className="sr-only">Menu</span>
          </button>
        </div>
        
        <div className="nav:hidden">
          <nav id="navigation" className={`${menuOpen ? 'max-h-96 py-4' : 'max-h-0 py-0'} w-full overflow-hidden transition-all duration-300 ease-in-out`}>
            <Navigation categories={categories} />
            <div className="mt-4 flex justify-center w-full">
              <Search mobileMenuOpen={menuOpen} />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Masthead;
