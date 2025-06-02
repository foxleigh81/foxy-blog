'use client';

import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import Search from '@/components/Search';
import UserAvatar from '@/components/Auth/UserAvatar';
import AuthModal from '@/components/Auth/AuthModal';
import ProfileEditModal from '@/components/Auth/ProfileEditModal';
import { useAuth } from '@/contexts/AuthContext';
import type { Category } from '@/sanity/schemaTypes/categoryType';
import Link from 'next/link';
import Image from 'next/image';
import styles from './masthead.module.css';

interface MastheadProps {
  title: string;
  subtitle: string;
  categories: Category[];
}

const Masthead: React.FC<MastheadProps> = ({ title, subtitle, categories }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const { user, loading } = useAuth();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header
      className={`w-full text-white py-8 mb-8 relative ${styles.masthead} ${menuOpen ? styles.menuOpen : ''}`}
    >
      <div className="container mx-auto relative z-10">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex-1 min-w-[200px] flex items-center gap-4">
            <Image
              src="/foxy-tail-logo.png"
              alt="Foxy's Tail Logo"
              width={70}
              height={70}
              className="rounded-full border-2 border-white drop-shadow-md ml-4"
            />
            <div className="flex flex-col">
              <Link href="/">
                <h1 className="text-4xl md:text-5xl font-bold text-white m-0 font-headers drop-shadow-md">
                  {title}
                </h1>
              </Link>
              <p className="text-sm md:text-m font-body font-bold text-white/80 mt-1 drop-shadow-md">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="hidden nav:flex items-center space-x-4">
            <Navigation categories={categories} className="justify-end" />
            <Search mobileMenuOpen={false} />

            {loading ? (
              // Loading placeholder - matches dimensions of sign in button/user avatar
              <div
                className={`flex items-center space-x-2 text-white bg-white/10 rounded-lg p-2 animate-pulse ${styles.authSection}`}
              >
                <div className="w-8 h-8 rounded-full bg-white/20"></div>
                <div className="hidden sm:block">
                  <div className="w-20 h-4 bg-white/20 rounded"></div>
                </div>
              </div>
            ) : (
              <div className={styles.authSection}>
                {user ? (
                  <UserAvatar onEditProfile={() => setProfileModalOpen(true)} />
                ) : (
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            className="nav:hidden p-2 bg-transparent border-0 cursor-pointer z-10 ml-2"
            onClick={toggleMenu}
            aria-expanded={menuOpen}
            aria-controls="navigation"
          >
            <span className="block relative w-6 h-6">
              <span
                className={`block absolute h-0.5 w-full bg-white rounded transition-all duration-300 ease-in-out ${menuOpen ? 'opacity-0' : 'opacity-100'} top-1/2 -translate-y-1/2`}
              ></span>
              <span
                className={`block absolute h-0.5 w-full bg-white rounded transition-all duration-300 ease-in-out ${menuOpen ? 'rotate-45 top-1/2 -translate-y-1/2' : 'top-0'}`}
              ></span>
              <span
                className={`block absolute h-0.5 w-full bg-white rounded transition-all duration-300 ease-in-out ${menuOpen ? '-rotate-45 top-1/2 -translate-y-1/2' : 'bottom-0'}`}
              ></span>
            </span>
            <span className="sr-only">Menu</span>
          </button>
        </div>

        <div className="nav:hidden">
          <nav
            id="navigation"
            className={`${menuOpen ? 'max-h-96 py-4' : 'max-h-0 py-0'} w-full overflow-hidden transition-all duration-300 ease-in-out`}
          >
            <Navigation categories={categories} />
            <div className="mt-4 flex justify-center w-full">
              <Search mobileMenuOpen={menuOpen} />
            </div>

            {/* Mobile auth section */}
            {loading ? (
              // Mobile loading placeholder
              <div className="mt-4 flex justify-center">
                <div
                  className={`flex items-center space-x-2 text-white bg-white/10 rounded-lg p-2 animate-pulse ${styles.authSection}`}
                >
                  <div className="w-8 h-8 rounded-full bg-white/20"></div>
                  <div className="w-20 h-4 bg-white/20 rounded"></div>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex justify-center">
                <div className={styles.authSection}>
                  {user ? (
                    <UserAvatar onEditProfile={() => setProfileModalOpen(true)} />
                  ) : (
                    <button
                      onClick={() => setAuthModalOpen(true)}
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span>Sign In</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Profile Edit Modal */}
      <ProfileEditModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
    </header>
  );
};

export default Masthead;
