'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, AlertCircle, Send, Calendar, X } from 'lucide-react';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import CategorySelector from '@/components/cms/CategorySelector';
import TagInput from '@/components/cms/TagInput';
import {
  saveArticleDraft,
  publishArticle,
  scheduleArticle,
  cancelScheduledArticle,
} from '@/lib/api/articles';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { Tag } from '@/types/database';

interface Article {
  id?: string;
  title: string;
  content: string;
  excerpt?: string;
  status?: string;
  scheduled_publish_at?: string | null;
  category_ids?: string[];
  tags?: Tag[];
}

interface ArticleFormProps {
  article?: Article;
}

export default function ArticleForm({ article }: ArticleFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(article?.title || '');
  const [content, setContent] = useState(article?.content || '');
  const [excerpt, setExcerpt] = useState(article?.excerpt || '');
  const [categoryIds, setCategoryIds] = useState<string[]>(article?.category_ids || []);
  const [selectedTags, setSelectedTags] = useState<Tag[]>(article?.tags || []);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(
    article?.scheduled_publish_at
      ? new Date(article.scheduled_publish_at).toISOString().slice(0, 16)
      : ''
  );

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

  const handlePublish = async () => {
    if (!article?.id) {
      setError('Please save the article first before publishing');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (!content.trim()) {
      setError('Please enter some content');
      return;
    }

    // Save first if there are unsaved changes
    if (hasUnsavedChanges) {
      await handleSave();
    }

    setPublishing(true);
    setError('');
    try {
      await publishArticle(article.id);
      setHasUnsavedChanges(false);
      router.push('/cms/articles');
      router.refresh();
    } catch (err) {
      console.error('Publish failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to publish article');
    } finally {
      setPublishing(false);
    }
  };

  const handleSchedule = async () => {
    if (!article?.id) {
      setError('Please save the article first before scheduling');
      return;
    }

    if (!scheduledDate) {
      setError('Please select a publish date and time');
      return;
    }

    const scheduledDateTime = new Date(scheduledDate);
    const now = new Date();

    if (scheduledDateTime <= now) {
      setError('Scheduled time must be in the future');
      return;
    }

    // Save first if there are unsaved changes
    if (hasUnsavedChanges) {
      await handleSave();
    }

    setScheduling(true);
    setError('');
    try {
      await scheduleArticle(article.id, scheduledDateTime.toISOString());
      setHasUnsavedChanges(false);
      setShowScheduleModal(false);
      router.push('/cms/articles');
      router.refresh();
    } catch (err) {
      console.error('Schedule failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to schedule article');
    } finally {
      setScheduling(false);
    }
  };

  const handleCancelSchedule = async () => {
    if (!article?.id) {
      return;
    }

    setScheduling(true);
    setError('');
    try {
      await cancelScheduledArticle(article.id);
      setScheduledDate('');
      router.refresh();
    } catch (err) {
      console.error('Cancel schedule failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel scheduled publication');
    } finally {
      setScheduling(false);
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
          {article?.status === 'scheduled' && article?.scheduled_publish_at && (
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              Scheduled for{' '}
              {new Date(article.scheduled_publish_at).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges}
            variant="outline"
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

          {article?.id && article?.status !== 'published' && (
            <>
              <Button
                onClick={() => setShowScheduleModal(true)}
                disabled={scheduling || publishing}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Schedule
              </Button>

              <Button
                onClick={handlePublish}
                disabled={publishing || scheduling}
                className="flex items-center gap-2"
              >
                {publishing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Publish Now
                  </>
                )}
              </Button>
            </>
          )}

          {article?.status === 'scheduled' && (
            <Button
              onClick={handleCancelSchedule}
              disabled={scheduling}
              variant="default"
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
            >
              {scheduling ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Canceling...
                </>
              ) : (
                <>
                  <X className="w-4 h-4" />
                  Cancel Schedule
                </>
              )}
            </Button>
          )}
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

        {/* Categories */}
        <div>
          <CategorySelector selectedIds={categoryIds} onChange={setCategoryIds} />
        </div>

        {/* Tags */}
        <div>
          <TagInput selectedTags={selectedTags} onChange={setSelectedTags} />
        </div>

        {/* Content Editor */}
        <div>
          <label className="block text-sm font-medium mb-2">Content *</label>
          <RichTextEditor content={content} onChange={setContent} />
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Schedule Publication</h2>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Publish Date & Time *</label>
              <Input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Select a future date and time for automatic publication
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => setShowScheduleModal(false)}
                variant="outline"
                disabled={scheduling}
              >
                Cancel
              </Button>
              <Button onClick={handleSchedule} disabled={scheduling || !scheduledDate}>
                {scheduling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
