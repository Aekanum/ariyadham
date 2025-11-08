'use client';

/**
 * SearchBar Component
 * Story 3.3: Search Functionality
 *
 * A search input component with debounced search and auto-suggestions
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import { ArticleSummary } from '@/types/article';

interface SearchBarProps {
  placeholder?: string;
  showSuggestions?: boolean;
  className?: string;
}

export default function SearchBar({
  placeholder = 'Search articles...',
  showSuggestions = true,
  className = '',
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ArticleSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&limit=5`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.articles || []);
        }
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (showSuggestions && isFocused) {
      fetchSuggestions();
    }
  }, [debouncedQuery, showSuggestions, isFocused]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsFocused(false);
      setSuggestions([]);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (slug: string) => {
    router.push(`/articles/${slug}`);
    setQuery('');
    setSuggestions([]);
    setIsFocused(false);
  };

  // Handle clear button
  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showSuggestionsDropdown =
    showSuggestions && isFocused && (suggestions.length > 0 || isLoading);

  return (
    <div ref={searchRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        {/* Search Icon */}
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Search Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-10 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400"
          aria-label="Search articles"
        />

        {/* Loading Spinner / Clear Button */}
        {query && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {isLoading ? (
              <div
                className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
                aria-label="Loading"
              />
            ) : (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Clear search"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestionsDropdown && (
        <div className="absolute z-10 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {isLoading && (
            <div className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
              Searching...
            </div>
          )}

          {!isLoading && suggestions.length > 0 && (
            <ul className="max-h-96 overflow-y-auto">
              {suggestions.map((article) => (
                <li key={article.id}>
                  <button
                    onClick={() => handleSuggestionClick(article.slug)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">{article.title}</div>
                    {article.excerpt && (
                      <div className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                        {article.excerpt}
                      </div>
                    )}
                    {article.author && (
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                        By {article.author.full_name}
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!isLoading && query && suggestions.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-2 dark:border-gray-700">
              <button
                onClick={handleSearch}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                See all results for &quot;{query}&quot;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
