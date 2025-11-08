/**
 * ArticleTaxonomy Component
 * Story 4.3: Article Categorization & Tagging
 *
 * Displays categories and tags for an article
 */

'use client';

import Link from 'next/link';
import { Category, Tag } from '@/types/database';
import { Folder, Hash } from 'lucide-react';

interface ArticleTaxonomyProps {
  categories?: Category[];
  tags?: Tag[];
}

export default function ArticleTaxonomy({ categories = [], tags = [] }: ArticleTaxonomyProps) {
  if (categories.length === 0 && tags.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 py-6 border-t border-gray-200 dark:border-gray-700">
      {/* Categories */}
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Folder className="w-4 h-4" />
            <span>Categories:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug_en}`}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: `${category.color_hex}20`,
                  color: category.color_hex || '#3B82F6',
                  borderColor: category.color_hex || '#3B82F6',
                  borderWidth: '1px',
                }}
              >
                {category.name_en}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Hash className="w-4 h-4" />
            <span>Tags:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Hash className="w-3 h-3 mr-1" />
                {tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
