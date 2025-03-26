import { SearchIcon, CloseIcon } from '@sanity/icons';
import { useState, useCallback } from 'react';

// Import the correct types from Sanity
import type { AssetSource, AssetSourceComponentProps } from 'sanity';

// Import stylesheet
import './GiphyAssetSource.css';

interface GiphyResponse {
  data: Array<{
    id: string;
    title: string;
    images: {
      original: {
        url: string;
        width: string;
        height: string;
      };
      fixed_width: {
        url: string;
        width: string;
        height: string;
      };
    };
  }>;
  pagination: {
    total_count: number;
    count: number;
    offset: number;
  };
}

const GiphySearch = (props: AssetSourceComponentProps) => {
  const { onSelect, onClose } = props;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GiphyResponse['data']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Pagination state
  const [currentOffset, setCurrentOffset] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 24;

  // Focus search input on mount
  const handleSearchInputRef = useCallback((node: HTMLInputElement | null) => {
    if (node) {
      node.focus();
    }
  }, []);

  const searchGiphy = useCallback(
    async (searchQuery: string, offset = 0) => {
      if (!searchQuery.trim()) return;

      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.giphy.com/v1/gifs/search?api_key=${process.env.SANITY_STUDIO_GIPHY_API_KEY}&q=${encodeURIComponent(searchQuery)}&limit=${resultsPerPage}&offset=${offset}`
        );
        const data: GiphyResponse = await response.json();
        setResults(data.data);
        setTotalResults(data.pagination.total_count);
        setCurrentOffset(offset);
        setCurrentPage(Math.floor(offset / resultsPerPage) + 1);
        setHasSearched(true);
      } catch (error) {
        console.error('Error searching Giphy:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [resultsPerPage]
  );

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      // Reset pagination when performing a new search
      setCurrentOffset(0);
      setCurrentPage(1);
      searchGiphy(query, 0);
    },
    [query, searchGiphy]
  );

  const handleNextPage = useCallback(() => {
    const nextOffset = currentOffset + resultsPerPage;
    if (nextOffset < totalResults) {
      searchGiphy(query, nextOffset);
    }
  }, [currentOffset, query, resultsPerPage, searchGiphy, totalResults]);

  const handlePrevPage = useCallback(() => {
    const prevOffset = Math.max(0, currentOffset - resultsPerPage);
    if (prevOffset !== currentOffset) {
      searchGiphy(query, prevOffset);
    }
  }, [currentOffset, query, resultsPerPage, searchGiphy]);

  const handleSelect = useCallback(
    async (gif: GiphyResponse['data'][0]) => {
      try {
        // Just use the URL directly
        onSelect([
          {
            kind: 'url',
            value: gif.images.original.url,
          },
        ]);
      } catch (error) {
        console.error('Error selecting Giphy:', error);
      }
    },
    [onSelect]
  );

  // Calculate total pages
  const totalPages = Math.ceil(totalResults / resultsPerPage);

  // Check if there are more results
  const hasNextPage = currentOffset + resultsPerPage < totalResults;
  const hasPrevPage = currentOffset > 0;

  return (
    <div className="giphy-container">
      {/* Header with logo and close button */}
      <div className="giphy-header">
        <svg
          className="giphy-logo"
          height="534"
          width="2500"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 163.79999999999998 35"
        >
          <g fill="none" fillRule="evenodd">
            <path d="M4 4h20v27H4z" fill="#fff" />
            <g fillRule="nonzero">
              <path d="M0 3h4v29H0z" fill="#04ff8e" />
              <path d="M24 11h4v21h-4z" fill="#8e2eff" />
              <path d="M0 31h28v4H0z" fill="#00c5ff" />
              <path d="M0 0h16v4H0z" fill="#fff152" />
              <path d="M24 8V4h-4V0h-4v12h12V8" fill="#ff5b5b" />
              <path d="M24 16v-4h4" fill="#551c99" />
            </g>
            <path d="M16 0v4h-4" fill="#999131" />
            <path
              d="M59.1 12c-2-1.9-4.4-2.4-6.2-2.4-4.4 0-7.3 2.6-7.3 8 0 3.5 1.8 7.8 7.3 7.8 1.4 0 3.7-.3 5.2-1.4v-3.5h-6.9v-6h13.3v12.1c-1.7 3.5-6.4 5.3-11.7 5.3-10.7 0-14.8-7.2-14.8-14.3S42.7 3.2 52.9 3.2c3.8 0 7.1.8 10.7 4.4zm9.1 19.2V4h7.6v27.2zm20.1-7.4v7.3h-7.7V4h13.2c7.3 0 10.9 4.6 10.9 9.9 0 5.6-3.6 9.9-10.9 9.9zm0-6.5h5.5c2.1 0 3.2-1.6 3.2-3.3 0-1.8-1.1-3.4-3.2-3.4h-5.5zM125 31.2V20.9h-9.8v10.3h-7.7V4h7.7v10.3h9.8V4h7.6v27.2zm24.2-17.9l5.9-9.3h8.7v.3l-10.8 16v10.8h-7.7V20.3L135 4.3V4h8.7z"
              fill="#000"
              fillRule="nonzero"
            />
          </g>
        </svg>
        <button className="giphy-close-button" onClick={onClose} type="button" aria-label="Close">
          <CloseIcon />
        </button>
      </div>

      {/* Search Form */}
      <div className="giphy-search-container">
        <form onSubmit={handleSearch} className="giphy-search-form">
          <input
            ref={handleSearchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Giphy..."
            className="giphy-search-input"
          />
          <button type="submit" disabled={isLoading} className="giphy-search-button">
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Content Area */}
      <div className="giphy-content">
        {isLoading ? (
          <div className="giphy-loading">
            <div className="giphy-spinner"></div>
          </div>
        ) : !hasSearched ? (
          <div className="giphy-initial-state">Search for GIFs above</div>
        ) : results.length === 0 ? (
          <div className="giphy-no-results">No results found. Try a different search term.</div>
        ) : (
          <div className="giphy-results-grid">
            {results.map((gif) => (
              <button key={gif.id} onClick={() => handleSelect(gif)} className="giphy-gif-item">
                <img src={gif.images.fixed_width.url} alt={gif.title} className="giphy-gif-image" />
                <div className="giphy-gif-overlay">
                  <span className="giphy-select-button">Select</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer with pagination */}
      {results.length > 0 && (
        <div className="giphy-footer">
          <div className="giphy-pagination">
            <div className="giphy-pagination-info">
              Page {currentPage} of {totalPages > 0 ? totalPages : 1}
            </div>
            <div className="giphy-pagination-controls">
              <button
                className="giphy-pagination-button"
                onClick={handlePrevPage}
                disabled={!hasPrevPage || isLoading}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                Back
              </button>
              <button
                className="giphy-pagination-button"
                onClick={handleNextPage}
                disabled={!hasNextPage || isLoading}
              >
                Next
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
          <div className="giphy-attribution">
            Powered by{' '}
            <a href="https://giphy.com/" target="_blank" rel="noopener noreferrer">
              GIPHY
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export const giphyAssetSource: AssetSource = {
  name: 'giphy',
  title: 'Giphy',
  component: GiphySearch,
  icon: SearchIcon,
};
