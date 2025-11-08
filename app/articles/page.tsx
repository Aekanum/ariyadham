import { createServerClient } from '@/lib/supabase-server';
import ArticleCard from '@/components/article/ArticleCard';
import Pagination from '@/components/ui/Pagination';
import { ArticleWithAuthor } from '@/types/article';

interface ArticlesPageProps {
  searchParams: {
    page?: string;
  };
}

export const metadata = {
  title: 'All Articles',
  description: 'Browse all published articles',
};

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const page = parseInt(searchParams.page || '1', 10);
  const pageSize = 12;
  const offset = (page - 1) * pageSize;

  const supabase = createServerClient();

  const { data: articles, count } = await supabase
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
    .order('published_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">All Articles</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {count} {count === 1 ? 'article' : 'articles'} published
          </p>
        </div>

        {/* Articles Grid */}
        {articles && articles.length > 0 ? (
          <>
            <div className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article as unknown as ArticleWithAuthor} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination currentPage={page} totalPages={totalPages} baseUrl="/articles" />
          </>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">No articles published yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
