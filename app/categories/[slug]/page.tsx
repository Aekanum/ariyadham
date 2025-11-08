import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';
import ArticleCard from '@/components/article/ArticleCard';
import Pagination from '@/components/ui/Pagination';
import { ArticleWithAuthor } from '@/types/article';
import { Metadata } from 'next';

interface CategoryPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    page?: string;
    sort?: 'newest' | 'popular';
  };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = params;
  const category = slug.charAt(0).toUpperCase() + slug.slice(1);

  return {
    title: `${category} Articles`,
    description: `Browse all articles in the ${category} category`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = params;
  const page = parseInt(searchParams.page || '1', 10);
  const sort = searchParams.sort || 'newest';
  const pageSize = 9;
  const offset = (page - 1) * pageSize;

  const supabase = createServerClient();
  const category = slug.charAt(0).toUpperCase() + slug.slice(1);

  // Build query
  let query = supabase
    .from('articles')
    .select(
      `
      *,
      author:user_profiles!author_id (
        id:user_id,
        full_name,
        avatar_url
      )
    `,
      { count: 'exact' }
    )
    .eq('status', 'published')
    .ilike('category', category);

  // Apply sorting
  if (sort === 'popular') {
    query = query.order('view_count', { ascending: false });
  } else {
    query = query.order('published_at', { ascending: false });
  }

  // Apply pagination
  query = query.range(offset, offset + pageSize - 1);

  const { data: articles, error, count } = await query;

  if (error || !articles || articles.length === 0) {
    notFound();
  }

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">{category}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {count} {count === 1 ? 'article' : 'articles'} in this category
          </p>
        </div>

        {/* Sort Options */}
        <div className="mb-8 flex gap-4">
          <a
            href={`/categories/${slug}?sort=newest`}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              sort === 'newest'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Newest
          </a>
          <a
            href={`/categories/${slug}?sort=popular`}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              sort === 'popular'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Popular
          </a>
        </div>

        {/* Articles Grid */}
        <div className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article as unknown as ArticleWithAuthor} />
          ))}
        </div>

        {/* Pagination */}
        <Pagination currentPage={page} totalPages={totalPages} baseUrl={`/categories/${slug}`} />
      </div>
    </div>
  );
}
