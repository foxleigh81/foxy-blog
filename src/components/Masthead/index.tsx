"use client";

import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import SocialLinks from '@/components/SocialLinks';

const Masthead: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="w-full bg-primary text-white py-4">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top row with title and social links */}
        <div className="flex flex-wrap items-center justify-between mb-2">
          <div className="flex-1 min-w-[200px]">
            <h1 className="text-2xl font-bold text-white m-0">The Foxy Blog</h1>
            <p className="text-sm text-white/80 mt-1">The inane mutterings of Alexander Foxleigh</p>
          </div>
          
          {/* Social links at top right - visible only on desktop */}
          <SocialLinks className="hidden md:flex justify-end" />
        </div>
        
        {/* Bottom row with navigation */}
        <div className="relative">
          <button 
            className="md:hidden p-2 bg-transparent border-0 cursor-pointer fixed top-4 right-4 z-10"
            onClick={toggleMenu}
            aria-expanded={menuOpen}
            aria-controls="navigation"
          >
            <span className="block relative w-6 h-6">
              <span className="block absolute h-0.5 w-full bg-white rounded transition-transform duration-300 ease-in-out origin-center">
                <span className={`block absolute h-0.5 w-full bg-white rounded transition-all duration-300 ease-in-out ${menuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`block absolute h-0.5 w-full bg-white rounded transition-all duration-300 ease-in-out ${menuOpen ? 'rotate-45' : '-translate-y-2'}`}></span>
                <span className={`block absolute h-0.5 w-full bg-white rounded transition-all duration-300 ease-in-out ${menuOpen ? '-rotate-45' : 'translate-y-2'}`}></span>
              </span>
            </span>
            <span className="sr-only">Menu</span>
          </button>

          <nav id="navigation" className={`${menuOpen ? 'max-h-screen' : 'max-h-0 md:max-h-full'} w-full overflow-hidden transition-all duration-300 ease-in-out md:overflow-visible`}>
            <div className="py-4 md:py-0">
              <Navigation />
              
              {/* Social links for mobile - shown only in mobile menu */}
              <div className="md:hidden mt-6 pt-4 border-t border-white/20 w-full">
                <p className="text-white/60 text-xs mb-3">Follow me:</p>
                <SocialLinks showLabels={true} iconSize={20} />
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Masthead;
