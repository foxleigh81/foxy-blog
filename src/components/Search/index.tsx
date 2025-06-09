'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './search.module.css';

interface SearchProps {
  mobileMenuOpen?: boolean;
}

const Search: React.FC<SearchProps> = ({ mobileMenuOpen = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Preserve hashtags in the search term for proper routing
      // If it's a single hashtag, the search page will redirect to the tag page
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // Focus the input when the mobile menu opens
  useEffect(() => {
    if (mobileMenuOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [mobileMenuOpen]);

  return (
    <div
      className={`${styles.searchContainer} ${styles.expanded} ${mobileMenuOpen ? styles.mobileExpanded : ''}`}
    >
      <form
        onSubmit={handleSubmit}
        className={`${styles.searchForm} ${mobileMenuOpen ? styles.mobileSearchForm : ''}`}
      >
        <input
          ref={inputRef}
          name="search"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className={styles.searchInput}
          aria-label="Search"
        />
        <button type="submit" className={styles.searchButton} aria-label="Submit search">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default Search;
