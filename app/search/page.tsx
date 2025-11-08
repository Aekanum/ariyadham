import { createServerClient } from '@/lib/supabase-server';
import ArticleCard from '@/components/article/ArticleCard';
import Pagination from '@/components/ui/Pagination';
import SearchBar from '@/components/search/SearchBar';
import { ArticleWithAuthor } from '@/types/article';
import Link from 'next/link';

interface SearchPageProps {
  searchParams: {
    q?: string;
    page?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  const page = parseInt(searchParams.page || '1');
  const limit = 12;

  let articles: ArticleWithAuthor[] = [];
  let totalResults = 0;
  let totalPages = 0;
  let error: string | null = null;

  // Only search if there's a query
  if (query.trim()) {
    const supabase = createServerClient();
    const offset = (page - 1) * limit;
    const searchTerm = `%${query.trim()}%`;

    try {
      // Perform search
      const { data: searchResults, error: searchError } = await supabase
        .from('articles')
        .select(
          `
          *,
          author:user_profiles!author_id (
            id:user_id,
            full_name,
            avatar_url
          )
        `
        )
        .eq('status', 'published')
        .or(`title.ilike.${searchTerm},excerpt.ilike.${searchTerm},content.ilike.${searchTerm}`)
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (searchError) {
        console.error('Search error:', searchError);
        error = 'Failed to search articles. Please try again.';
      } else {
        articles = searchResults || [];
      }

      // Get total count
      const { count, error: countError } = await supabase
        .from('articles')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published')
        .or(`title.ilike.${searchTerm},excerpt.ilike.${searchTerm},content.ilike.${searchTerm}`);

      if (!countError && count !== null) {
        totalResults = count;
        totalPages = Math.ceil(totalResults / limit);
      }
    } catch (err) {
      console.error('Unexpected search error:', err);
      error = 'An unexpected error occurred. Please try again.';
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>

          <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Search Results
          </h1>

          {/* Search Bar */}
          <div className="mb-4 max-w-2xl">
            <SearchBar placeholder="Search articles..." showSuggestions={false} />
          </div>

          {/* Search Info */}
          {query && (
            <div className="text-gray-600 dark:text-gray-400">
              {totalResults > 0 ? (
                <p>
                  Found <span className="font-semibold">{totalResults}</span> result
                  {totalResults !== 1 ? 's' : ''} for &quot;
                  <span className="font-semibold text-gray-900 dark:text-white">{query}</span>
                  &quot;
                </p>
              ) : (
                !error && (
                  <p>
                    No results found for &quot;
                    <span className="font-semibold text-gray-900 dark:text-white">{query}</span>
                    &quot;
                  </p>
                )
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Empty State - No Query */}
        {!query.trim() && (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
            <svg
              className="mx-auto mb-4 h-16 w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              Start Searching
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Enter keywords to find dharma articles and teachings
            </p>
          </div>
        )}

        {/* Empty State - No Results */}
        {query.trim() && !error && articles.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
            <svg
              className="mx-auto mb-4 h-16 w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              No results found
            </h2>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              We couldn&apos;t find any articles matching &quot;{query}&quot;
            </p>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="mb-2 font-medium">Try:</p>
              <ul className="space-y-1">
                <li>• Using different keywords</li>
                <li>• Checking for spelling errors</li>
                <li>• Using more general terms</li>
                <li>• Browsing by categories instead</li>
              </ul>
            </div>
            <Link
              href="/categories/meditation"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
            >
              Browse Categories
            </Link>
          </div>
        )}

        {/* Search Results */}
        {query.trim() && !error && articles.length > 0 && (
          <>
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  baseUrl={`/search?q=${encodeURIComponent(query)}`}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';

  return {
    title: query ? `Search results for "${query}" - Ariyadham` : 'Search - Ariyadham',
    description: query
      ? `Find dharma articles and teachings about ${query}`
      : 'Search for Buddhist dharma teachings and articles',
  };
}
