'use client';

/**
 * TagInput Component
 * Story 4.3: Article Categorization & Tagging
 *
 * Allows authors to add and create tags for their articles with autocomplete
 */

import { useState, useEffect, useRef } from 'react';
import { Tag } from '@/types/database';
import { searchTags } from '@/lib/api/tags';
import { X, Plus, Hash } from 'lucide-react';
import { Input } from '@/components/ui/Input';

interface TagInputProps {
  selectedTags: Tag[];
  onChange: (tags: Tag[]) => void;
  maxTags?: number;
}

export default function TagInput({ selectedTags, onChange, maxTags = 10 }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search for tags when input changes
  useEffect(() => {
    const searchForTags = async () => {
      if (inputValue.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        setLoading(true);
        const results = await searchTags(inputValue);
        // Filter out already selected tags
        const filteredResults = results.filter(
          (tag) => !selectedTags.some((selected) => selected.id === tag.id)
        );
        setSuggestions(filteredResults);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Failed to search tags:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchForTags, 300);
    return () => clearTimeout(debounceTimer);
  }, [inputValue, selectedTags]);

  const handleAddTag = (tag: Tag) => {
    if (selectedTags.length < maxTags && !selectedTags.some((t) => t.id === tag.id)) {
      onChange([...selectedTags, tag]);
      setInputValue('');
      setSuggestions([]);
      setShowSuggestions(false);
      inputRef.current?.focus();
    }
  };

  const handleCreateNewTag = () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue || selectedTags.length >= maxTags) return;

    // Check if tag with this name already exists in selected tags
    if (selectedTags.some((tag) => tag.name.toLowerCase() === trimmedValue.toLowerCase())) {
      return;
    }

    // Create a temporary tag object (will be created on backend when article is saved)
    const newTag: Tag = {
      id: `temp-${Date.now()}`, // Temporary ID
      name: trimmedValue,
      slug: trimmedValue.toLowerCase().replace(/\s+/g, '-'),
      description: null,
      status: 'pending',
      created_by: null,
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onChange([...selectedTags, newTag]);
    setInputValue('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleRemoveTag = (tagId: string) => {
    onChange(selectedTags.filter((tag) => tag.id !== tagId));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0) {
        handleAddTag(suggestions[0]);
      } else if (inputValue.trim()) {
        handleCreateNewTag();
      }
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      // Remove last tag on backspace if input is empty
      handleRemoveTag(selectedTags[selectedTags.length - 1].id);
    }
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-2">
        Tags {selectedTags.length > 0 && `(${selectedTags.length}/${maxTags})`}
      </label>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedTags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
            >
              <Hash className="w-3 h-3" />
              {tag.name}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag.id)}
                className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue.length >= 2 && setShowSuggestions(true)}
          placeholder={
            selectedTags.length >= maxTags
              ? `Maximum ${maxTags} tags reached`
              : 'Type to search or create tags...'
          }
          disabled={selectedTags.length >= maxTags}
          className="pr-10"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && inputValue.length >= 2 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.length > 0 ? (
            <ul>
              {suggestions.map((tag) => (
                <li key={tag.id}>
                  <button
                    type="button"
                    onClick={() => handleAddTag(tag)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Hash className="w-4 h-4 text-gray-400" />
                    <span>{tag.name}</span>
                    <span className="ml-auto text-xs text-gray-500">
                      {tag.usage_count} {tag.usage_count === 1 ? 'use' : 'uses'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3">
              <button
                type="button"
                onClick={handleCreateNewTag}
                className="w-full text-left flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                <Plus className="w-4 h-4" />
                <span>
                  Create tag <strong>"{inputValue}"</strong>
                </span>
              </button>
              <p className="text-xs text-gray-500 mt-2">Press Enter to create this new tag</p>
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500 mt-2">
        Type at least 2 characters to search. Press Enter to add a tag or create a new one.
      </p>
    </div>
  );
}
