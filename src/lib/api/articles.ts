export interface ArticleDraft {
  id?: string;
  title: string;
  content: string;
  excerpt?: string;
  status: string;
}

export async function saveArticleDraft(data: ArticleDraft): Promise<ArticleDraft & { id: string }> {
  const response = await fetch('/api/articles/draft', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save article');
  }

  return response.json();
}
