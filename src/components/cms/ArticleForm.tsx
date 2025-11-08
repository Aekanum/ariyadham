'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, AlertCircle } from 'lucide-react';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { saveArticleDraft } from '@/lib/api/articles';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';

interface Article {
  id?: string;
  title: string;
  content: string;
  excerpt?: string;
  status?: string;
}

interface ArticleFormProps {
  article?: Article;
}

export default function ArticleForm({ article }: ArticleFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(article?.title || '');
  const [content, setContent] = useState(article?.content || '');
  const [excerpt, setExcerpt] = useState(article?.excerpt || '');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState('');

  // Track unsaved changes
  const { hasUnsavedChanges, setHasUnsavedChanges } = useUnsavedChanges();

  // Mark as changed when content updates
  useEffect(() => {
    if (article) {
      const changed =
        title !== article.title ||
        content !== article.content ||
        excerpt !== (article.excerpt || '');
      setHasUnsavedChanges(changed);
    } else {
      setHasUnsavedChanges(title !== '' || content !== '' || excerpt !== '');
    }
  }, [title, content, excerpt, article, setHasUnsavedChanges]);

  // Auto-save functionality
  useAutoSave(
    async () => {
      if (!title || !content) return;
      try {
        await saveArticleDraft({
          id: article?.id,
          title,
          content,
          excerpt,
          status: 'draft',
        });
        setLastSaved(new Date());
      } catch (err) {
        console.error('Auto-save failed:', err);
      }
    },
    [title, content, excerpt],
    30000 // Auto-save every 30 seconds
  );

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (!content.trim()) {
      setError('Please enter some content');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const savedArticle = await saveArticleDraft({
        id: article?.id,
        title,
        content,
        excerpt,
        status: 'draft',
      });

      setHasUnsavedChanges(false);
      setLastSaved(new Date());

      if (!article?.id) {
        // Redirect to edit page for new article
        router.push(`/cms/articles/${savedArticle.id}/edit`);
      }
    } catch (err) {
      console.error('Save failed:', err);
      setError('Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{article?.id ? 'Edit Article' : 'Create Article'}</h1>
          {lastSaved && (
            <p className="text-sm text-gray-500">Last saved {lastSaved.toLocaleTimeString()}</p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges}
            className="flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Draft
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
        </div>
      )}

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600" />
          <span className="text-sm text-yellow-700 dark:text-yellow-400">
            You have unsaved changes
          </span>
        </div>
      )}

      {/* Form */}
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">Title *</label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter article title..."
            className="text-2xl font-bold"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium mb-2">Excerpt (Optional)</label>
          <Input
            type="text"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Brief summary of the article..."
            maxLength={200}
          />
          <p className="text-xs text-gray-500 mt-1">{excerpt.length}/200 characters</p>
        </div>

        {/* Content Editor */}
        <div>
          <label className="block text-sm font-medium mb-2">Content *</label>
          <RichTextEditor content={content} onChange={setContent} />
        </div>
      </div>
    </div>
  );
}
