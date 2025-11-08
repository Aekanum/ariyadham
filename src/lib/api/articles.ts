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

/**
 * Publish an article immediately
 * Story 4.2: Article Publishing & Scheduling
 */
export async function publishArticle(articleId: string): Promise<ArticleDraft & { id: string }> {
  const response = await fetch(`/api/articles/${articleId}/publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to publish article');
  }

  return response.json();
}

/**
 * Schedule an article for future publication
 * Story 4.2: Article Publishing & Scheduling
 */
export async function scheduleArticle(
  articleId: string,
  scheduledPublishAt: string
): Promise<ArticleDraft & { id: string }> {
  const response = await fetch(`/api/articles/${articleId}/schedule`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ scheduled_publish_at: scheduledPublishAt }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to schedule article');
  }

  return response.json();
}

/**
 * Cancel a scheduled publication
 * Story 4.2: Article Publishing & Scheduling
 */
export async function cancelScheduledArticle(
  articleId: string
): Promise<ArticleDraft & { id: string }> {
  const response = await fetch(`/api/articles/${articleId}/schedule`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to cancel scheduled publication');
  }

  return response.json();
}
