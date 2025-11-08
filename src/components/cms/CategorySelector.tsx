'use client';

/**
 * CategorySelector Component
 * Story 4.3: Article Categorization & Tagging
 *
 * Allows authors to select categories for their articles
 */

import { useState, useEffect } from 'react';
import { Category } from '@/types/database';
import { getCategories } from '@/lib/api/categories';
import { Loader2 } from 'lucide-react';

interface CategorySelectorProps {
  selectedIds: string[];
  onChange: (categoryIds: string[]) => void;
  maxSelections?: number;
}

export default function CategorySelector({
  selectedIds,
  onChange,
  maxSelections = 3,
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (categoryId: string) => {
    if (selectedIds.includes(categoryId)) {
      // Remove category
      onChange(selectedIds.filter((id) => id !== categoryId));
    } else {
      // Add category (check max limit)
      if (selectedIds.length < maxSelections) {
        onChange([...selectedIds, categoryId]);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading categories...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>;
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        Categories {selectedIds.length > 0 && `(${selectedIds.length}/${maxSelections} selected)`}
      </label>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isSelected = selectedIds.includes(category.id);
          const isDisabled = !isSelected && selectedIds.length >= maxSelections;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => handleToggle(category.id)}
              disabled={isDisabled}
              className={`
                px-3 py-2 rounded-lg border text-sm font-medium transition-colors
                ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                }
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              style={{
                borderColor: isSelected ? category.color_hex || '#3B82F6' : undefined,
              }}
            >
              {category.name_en}
            </button>
          );
        })}
      </div>
      {selectedIds.length >= maxSelections && (
        <p className="text-xs text-gray-500 mt-2">
          Maximum {maxSelections} categories can be selected
        </p>
      )}
    </div>
  );
}
