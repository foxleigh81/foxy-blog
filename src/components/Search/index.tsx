"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './search.module.css';

const Search: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Focus the input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const toggleSearch = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      // Reset search term when opening
      setSearchTerm('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Preserve hashtags in the search term for proper routing
      // If it's a single hashtag, the search page will redirect to the tag page
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      // Close the search after submitting
      setIsExpanded(false);
    }
  };

  return (
    <div className={`${styles.searchContainer} ${isExpanded ? styles.expanded : ''}`}>
      {!isExpanded ? (
        <button 
          onClick={toggleSearch}
          className={styles.searchIcon}
          aria-label="Open search"
          title="Click to search"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      ) : (
        <form onSubmit={handleSubmit} className={styles.searchForm}>
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className={styles.searchInput}
            aria-label="Search"
          />
          <button 
            type="submit" 
            className={styles.searchButton}
            aria-label="Submit search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button 
            type="button" 
            onClick={toggleSearch}
            className={styles.closeButton}
            aria-label="Close search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </form>
      )}
    </div>
  );
};

export default Search;
