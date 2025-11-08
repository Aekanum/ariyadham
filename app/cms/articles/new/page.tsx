import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';
import ArticleForm from '@/components/cms/ArticleForm';
import { checkAuthorPermission } from '@/lib/auth/permissions';

export const metadata: Metadata = {
  title: 'Create Article - Ariyadham CMS',
};

export default async function NewArticlePage() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/cms/articles/new');
  }

  const hasPermission = await checkAuthorPermission(user.id);
  if (!hasPermission) {
    redirect('/unauthorized');
  }

  return (
    <div className="container py-8">
      <ArticleForm />
    </div>
  );
}
