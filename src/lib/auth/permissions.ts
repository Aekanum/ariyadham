import { createServerClient } from '@/lib/supabase-server';

export async function checkAuthorPermission(
  userId: string,
  requiredRole: 'author' | 'admin' = 'author'
): Promise<boolean> {
  const supabase = createServerClient();

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (!profile) return false;

  if (requiredRole === 'admin') {
    return profile.role === 'admin';
  }

  return profile.role === 'author' || profile.role === 'admin';
}
