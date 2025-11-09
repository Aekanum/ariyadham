/**
 * ArticleHeader Component
 * Story 3.1: Article Display & Reading Interface
 * Story 8.2: Translate Dynamic Content (Articles)
 *
 * Displays article metadata including title, excerpt, author, date, and reading time
 */

import Image from 'next/image';
import { ArticleWithAuthor } from '@/types/article';
import { formatDate } from '@/lib/utils/date';
import LanguageSwitcher from './LanguageSwitcher';

interface ArticleHeaderProps {
  article: ArticleWithAuthor;
}

export default function ArticleHeader({ article }: ArticleHeaderProps) {
  const publishedDate = article.published_at ? formatDate(article.published_at, 'long') : null;

  return (
    <header className="mb-8 border-b border-gray-200 pb-8 dark:border-gray-700">
      {/* Featured Image */}
      {article.featured_image_url && (
        <div className="mb-8 overflow-hidden rounded-lg">
          <Image
            src={article.featured_image_url}
            alt={article.title}
            width={1200}
            height={630}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1200px"
            className="h-auto w-full object-cover"
            priority
            quality={90}
          />
        </div>
      )}

      {/* Category Badge */}
      {article.category && (
        <div className="mb-4">
          <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {article.category}
          </span>
        </div>
      )}

      {/* Title */}
      <h1 className="mb-4 text-4xl font-bold leading-tight text-gray-900 dark:text-white sm:text-5xl">
        {article.title}
      </h1>

      {/* Excerpt */}
      {article.excerpt && (
        <p className="mb-6 text-xl text-gray-600 dark:text-gray-400">{article.excerpt}</p>
      )}

      {/* Language Switcher */}
      {article.translations && article.translations.length > 0 && (
        <div className="mb-6">
          <LanguageSwitcher
            currentLanguage={article.language}
            currentSlug={article.slug}
            translations={article.translations}
          />
        </div>
      )}

      {/* Author and Metadata */}
      <div className="flex items-center gap-4">
        {/* Author Avatar */}
        {article.author.avatar_url ? (
          <Image
            src={article.author.avatar_url}
            alt={article.author.full_name}
            width={48}
            height={48}
            sizes="48px"
            className="rounded-full"
            loading="lazy"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
            <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
              {article.author.full_name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Author Info */}
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{article.author.full_name}</p>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            {publishedDate && <span>{publishedDate}</span>}
            {article.reading_time_minutes && (
              <>
                <span>•</span>
                <span>{article.reading_time_minutes} min read</span>
              </>
            )}
            {article.view_count > 0 && (
              <>
                <span>•</span>
                <span>{article.view_count.toLocaleString()} views</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
