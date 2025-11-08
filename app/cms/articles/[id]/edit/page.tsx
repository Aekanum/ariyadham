import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';
import ArticleForm from '@/components/cms/ArticleForm';
import { checkAuthorPermission } from '@/lib/auth/permissions';

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Edit Article - Ariyadham CMS',
};

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params;
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/cms/articles/${id}/edit`);
  }

  // Fetch article
  const { data: article, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !article) {
    notFound();
  }

  // Check if user owns this article or is admin
  if (article.author_id !== user.id) {
    const hasAdminPermission = await checkAuthorPermission(user.id, 'admin');
    if (!hasAdminPermission) {
      redirect('/unauthorized');
    }
  }

  return (
    <div className="container py-8">
      <ArticleForm article={article} />
    </div>
  );
}
