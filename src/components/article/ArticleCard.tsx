import Link from 'next/link';
import Image from 'next/image';
import { ArticleWithAuthor } from '@/types/article';
import { formatDate } from '@/lib/utils/date';
import { Star } from 'lucide-react';

interface ArticleCardProps {
  article: ArticleWithAuthor;
  isFeatured?: boolean;
}

export default function ArticleCard({ article, isFeatured = false }: ArticleCardProps) {
  const publishedDate = article.published_at ? formatDate(article.published_at) : null;

  return (
    <article className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      {/* Featured Badge */}
      {isFeatured && (
        <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-full bg-yellow-400 px-3 py-1 text-xs font-semibold text-gray-900 shadow-md">
          <Star className="h-3 w-3 fill-gray-900" />
          Featured
        </div>
      )}

      {/* Featured Image */}
      {article.featured_image_url && (
        <Link href={`/articles/${article.slug}`}>
          <div className="aspect-video w-full overflow-hidden">
            <Image
              src={article.featured_image_url}
              alt={article.title}
              width={600}
              height={400}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
          </div>
        </Link>
      )}

      <div className="p-6">
        {/* Category Badge */}
        {article.category && (
          <div className="mb-3">
            <Link
              href={`/categories/${article.category.toLowerCase()}`}
              className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 transition-colors hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
            >
              {article.category}
            </Link>
          </div>
        )}

        {/* Title */}
        <Link href={`/articles/${article.slug}`}>
          <h3 className="mb-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
            {article.title}
          </h3>
        </Link>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="mb-4 line-clamp-3 text-gray-600 dark:text-gray-400">{article.excerpt}</p>
        )}

        {/* Author and Metadata */}
        <div className="flex items-center gap-3">
          {/* Author Avatar */}
          {article.author.avatar_url ? (
            <Image
              src={article.author.avatar_url}
              alt={article.author.full_name}
              width={32}
              height={32}
              sizes="32px"
              className="rounded-full"
              loading="lazy"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {article.author.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Author Info */}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {article.author.full_name}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              {publishedDate && <span>{publishedDate}</span>}
              {article.reading_time_minutes && (
                <>
                  <span>•</span>
                  <span>{article.reading_time_minutes} min read</span>
                </>
              )}
              {/* Anjali count (Story 5.1) */}
              {article.anjali_count > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span role="img" aria-label="anjali">
                      🙏
                    </span>
                    {article.anjali_count}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
