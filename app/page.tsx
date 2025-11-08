import { createServerClient } from '@/lib/supabase-server';
import ArticleCard from '@/components/article/ArticleCard';
import { ArticleWithAuthor } from '@/types/article';
import Link from 'next/link';

export default async function HomePage() {
  const supabase = createServerClient();

  // Fetch featured articles (most recent with high view count)
  const { data: featuredArticles } = await supabase
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
    .order('view_count', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(3);

  // Fetch recent articles
  const { data: recentArticles } = await supabase
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
    .order('published_at', { ascending: false })
    .limit(6);

  // Fetch popular articles
  const { data: popularArticles } = await supabase
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
    .order('view_count', { ascending: false })
    .limit(6);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
            Ariyadham
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Discover profound dharma teachings and spiritual wisdom
          </p>
        </div>

        {/* Featured Articles */}
        {featuredArticles && featuredArticles.length > 0 && (
          <section className="mb-16">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Featured Articles
              </h2>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredArticles.map((article) => (
                <ArticleCard key={article.id} article={article as unknown as ArticleWithAuthor} />
              ))}
            </div>
          </section>
        )}

        {/* Recent Articles */}
        {recentArticles && recentArticles.length > 0 && (
          <section className="mb-16">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Recent Articles</h2>
              <Link
                href="/articles"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View all →
              </Link>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {recentArticles.map((article) => (
                <ArticleCard key={article.id} article={article as unknown as ArticleWithAuthor} />
              ))}
            </div>
          </section>
        )}

        {/* Popular Articles */}
        {popularArticles && popularArticles.length > 0 && (
          <section className="mb-16">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Popular Articles</h2>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {popularArticles.map((article) => (
                <ArticleCard key={article.id} article={article as unknown as ArticleWithAuthor} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
