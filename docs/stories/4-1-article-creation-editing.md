# Story 4.1: Article Creation & Editing

**Epic**: 4 - Author CMS & Publishing
**Status**: 🚧 IN PROGRESS
**Started**: 2025-11-08

---

## Story

**As an** author
**I want to** create and edit articles using a rich text editor
**So that** I can write dharma content with formatting

---

## Acceptance Criteria

### 📝 Article Creation Form

**Given** an author on the create article page
**When** they fill in title and content
**Then** they can format text (bold, italic, headings, lists)
**And** they can add images

### 💾 Draft Saving

**When** they click "Save Draft"
**Then** article is saved without publishing
**And** they can return to edit later

### ⚡ Auto-Save & Warnings

**And** they receive real-time save feedback
**And** unsaved changes warning if they try to leave

### Implementation Checklist

- [ ] Create rich text editor component using Tiptap
- [ ] Implement article creation form
- [ ] Add title and content fields
- [ ] Implement formatting toolbar (bold, italic, headings, lists, quotes, code)
- [ ] Add image upload functionality
- [ ] Integrate with Supabase Storage for images
- [ ] Implement auto-save functionality
- [ ] Add unsaved changes detection and warning
- [ ] Create API endpoint for saving drafts
- [ ] Implement article edit page
- [ ] Add role-based access control (author only)
- [ ] Create author CMS layout
- [ ] Add navigation to author dashboard
- [ ] Implement success/error feedback
- [ ] Add loading states during save

---

## Technical Implementation

### 1. Database Schema Updates

**Migration: Add CMS-specific fields**

```sql
-- Update articles table for CMS functionality
ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS content_json JSONB,
  ADD COLUMN IF NOT EXISTS auto_saved_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS is_auto_saved BOOLEAN DEFAULT FALSE;

-- Create index for author queries
CREATE INDEX IF NOT EXISTS idx_articles_author_status
  ON articles(author_id, status);

-- Add RLS policies for authors
CREATE POLICY "Authors can create articles"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('author', 'admin')
    )
  );

CREATE POLICY "Authors can update own articles"
  ON articles FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete own drafts"
  ON articles FOR DELETE
  TO authenticated
  USING (
    auth.uid() = author_id AND
    status = 'draft'
  );
```

### 2. Rich Text Editor Component

**File: `src/components/editor/RichTextEditor.tsx`**

```typescript
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { useCallback, useEffect } from 'react';
import EditorToolbar from './EditorToolbar';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start writing your dharma content...',
  editable = true,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-lg max-w-none min-h-[500px] px-4 py-3 focus:outline-none',
      },
    },
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900">
      {editable && <EditorToolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}
```

### 3. Editor Toolbar

**File: `src/components/editor/EditorToolbar.tsx`**

```typescript
'use client';

import { type Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Image,
  Link,
  Undo,
  Redo,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/Separator';
import { useState } from 'react';
import ImageUploadDialog from './ImageUploadDialog';

interface EditorToolbarProps {
  editor: Editor;
}

export default function EditorToolbar({ editor }: EditorToolbarProps) {
  const [showImageDialog, setShowImageDialog] = useState(false);

  const addImage = (url: string) => {
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const url = window.prompt('Enter link URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50 dark:bg-gray-800">
        {/* Text Formatting */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : ''}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Headings */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={
            editor.isActive('heading', { level: 1 })
              ? 'bg-gray-200 dark:bg-gray-700'
              : ''
          }
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={
            editor.isActive('heading', { level: 2 })
              ? 'bg-gray-200 dark:bg-gray-700'
              : ''
          }
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={
            editor.isActive('heading', { level: 3 })
              ? 'bg-gray-200 dark:bg-gray-700'
              : ''
          }
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Lists */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={
            editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700' : ''
          }
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={
            editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-700' : ''
          }
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Quote & Code */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={
            editor.isActive('blockquote') ? 'bg-gray-200 dark:bg-gray-700' : ''
          }
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={
            editor.isActive('codeBlock') ? 'bg-gray-200 dark:bg-gray-700' : ''
          }
          title="Code Block"
        >
          <Code className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Media & Links */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowImageDialog(true)}
          title="Add Image"
        >
          <Image className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={addLink} title="Add Link">
          <Link className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Undo/Redo */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </Button>
      </div>

      <ImageUploadDialog
        open={showImageDialog}
        onClose={() => setShowImageDialog(false)}
        onImageUploaded={addImage}
      />
    </>
  );
}
```

### 4. Image Upload Dialog

**File: `src/components/editor/ImageUploadDialog.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { uploadImage } from '@/lib/storage/images';
import { toast } from 'sonner';

interface ImageUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onImageUploaded: (url: string) => void;
}

export default function ImageUploadDialog({
  open,
  onClose,
  onImageUploaded,
}: ImageUploadDialogProps) {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const url = await uploadImage(file, 'article-images');
      setImageUrl(url);
      onImageUploaded(url);
      toast.success('Image uploaded successfully');
      onClose();
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (imageUrl.trim()) {
      onImageUploaded(imageUrl);
      setImageUrl('');
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add Image</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Upload Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
            />
            {uploading && (
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
                Or
              </span>
            </div>
          </div>

          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleUrlSubmit} className="flex-1">
              Insert Image
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 5. Article Form Component

**File: `src/components/cms/ArticleForm.tsx`**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Save, AlertCircle } from 'lucide-react';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Article } from '@/types/article';
import { saveArticleDraft } from '@/lib/api/articles';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';

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

  // Track unsaved changes
  const { hasUnsavedChanges, setHasUnsavedChanges } = useUnsavedChanges();

  // Mark as changed when content updates
  useEffect(() => {
    if (article) {
      const changed =
        title !== article.title ||
        content !== article.content ||
        excerpt !== article.excerpt;
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
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    },
    [title, content, excerpt],
    30000 // Auto-save every 30 seconds
  );

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!content.trim()) {
      toast.error('Please enter some content');
      return;
    }

    setSaving(true);
    try {
      const savedArticle = await saveArticleDraft({
        id: article?.id,
        title,
        content,
        excerpt,
        status: 'draft',
      });

      toast.success('Draft saved successfully');
      setHasUnsavedChanges(false);
      setLastSaved(new Date());

      if (!article?.id) {
        // Redirect to edit page for new article
        router.push(`/cms/articles/${savedArticle.id}/edit`);
      }
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {article?.id ? 'Edit Article' : 'Create Article'}
          </h1>
          {lastSaved && (
            <p className="text-sm text-gray-500">
              Last saved {lastSaved.toLocaleTimeString()}
            </p>
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
          <label className="block text-sm font-medium mb-2">
            Excerpt (Optional)
          </label>
          <Input
            type="text"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Brief summary of the article..."
            maxLength={200}
          />
          <p className="text-xs text-gray-500 mt-1">
            {excerpt.length}/200 characters
          </p>
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
```

### 6. CMS Pages

**File: `app/cms/articles/new/page.tsx`**

```typescript
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import ArticleForm from '@/components/cms/ArticleForm';
import { checkAuthorPermission } from '@/lib/auth/permissions';

export const metadata: Metadata = {
  title: 'Create Article - Ariyadham CMS',
};

export default async function NewArticlePage() {
  const supabase = createServerSupabaseClient();
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
```

**File: `app/cms/articles/[id]/edit/page.tsx`**

```typescript
import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
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
  const supabase = createServerSupabaseClient();
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
```

### 7. API Routes

**File: `app/api/articles/draft/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { generateSlug } from '@/lib/utils/slugs';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, content, excerpt } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Generate slug from title
    const slug = generateSlug(title);

    if (id) {
      // Update existing article
      const { data, error } = await supabase
        .from('articles')
        .update({
          title,
          content,
          excerpt,
          slug,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('author_id', user.id) // Ensure user owns the article
        .select()
        .single();

      if (error) {
        console.error('Update error:', error);
        return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
      }

      return NextResponse.json(data);
    } else {
      // Create new article
      const { data, error } = await supabase
        .from('articles')
        .insert({
          title,
          content,
          excerpt,
          slug,
          author_id: user.id,
          status: 'draft',
        })
        .select()
        .single();

      if (error) {
        console.error('Insert error:', error);
        return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
      }

      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 8. Custom Hooks

**File: `src/hooks/useAutoSave.ts`**

```typescript
import { useEffect, useRef } from 'react';

export function useAutoSave(
  callback: () => void | Promise<void>,
  deps: any[],
  delay: number = 30000
) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      callback();
    }, delay);

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, deps);
}
```

**File: `src/hooks/useUnsavedChanges.ts`**

```typescript
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useUnsavedChanges() {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  return { hasUnsavedChanges, setHasUnsavedChanges };
}
```

### 9. Utility Functions

**File: `src/lib/utils/slugs.ts`**

```typescript
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens
    .trim();
}
```

**File: `src/lib/api/articles.ts`**

```typescript
import { Article } from '@/types/article';

export async function saveArticleDraft(data: {
  id?: string;
  title: string;
  content: string;
  excerpt?: string;
  status: string;
}): Promise<Article> {
  const response = await fetch('/api/articles/draft', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to save article');
  }

  return response.json();
}
```

**File: `src/lib/storage/images.ts`**

```typescript
import { createClientSupabaseClient } from '@/lib/supabase/client';

export async function uploadImage(file: File, bucket: string = 'article-images'): Promise<string> {
  const supabase = createClientSupabaseClient();

  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${bucket}/${fileName}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    throw error;
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return publicUrl;
}
```

**File: `src/lib/auth/permissions.ts`**

```typescript
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function checkAuthorPermission(
  userId: string,
  requiredRole: 'author' | 'admin' = 'author'
): Promise<boolean> {
  const supabase = createServerSupabaseClient();

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
```

---

## Files to Create/Modify

```
src/
├── components/
│   ├── editor/
│   │   ├── RichTextEditor.tsx           # Main editor component
│   │   ├── EditorToolbar.tsx            # Formatting toolbar
│   │   └── ImageUploadDialog.tsx        # Image upload UI
│   ├── cms/
│   │   └── ArticleForm.tsx              # Article creation/edit form
│   └── ui/
│       ├── Button.tsx                   # (existing)
│       ├── Input.tsx                    # (existing)
│       └── Separator.tsx                # New component
├── lib/
│   ├── api/
│   │   └── articles.ts                  # Article API client
│   ├── auth/
│   │   └── permissions.ts               # Permission checking
│   ├── storage/
│   │   └── images.ts                    # Image upload utilities
│   └── utils/
│       └── slugs.ts                     # Slug generation
├── hooks/
│   ├── useAutoSave.ts                   # Auto-save hook
│   └── useUnsavedChanges.ts             # Unsaved changes warning
app/
├── cms/
│   └── articles/
│       ├── new/
│       │   └── page.tsx                 # Create article page
│       └── [id]/
│           └── edit/
│               └── page.tsx             # Edit article page
└── api/
    └── articles/
        └── draft/
            └── route.ts                 # Draft save API
supabase/
└── migrations/
    └── 20251108_cms_fields.sql          # Database updates
```

---

## Dependencies to Install

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-placeholder @tiptap/extension-link lucide-react sonner
```

---

## Prerequisites

- Story 1.3 ✅ (Authentication Infrastructure)
- Story 2.2 ✅ (User Roles & Permissions)

---

## Quality Checks

### Type Safety

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

### Format

```bash
npm run format
```

### Build

```bash
npm run build
```

### Manual Testing

- [ ] Author can access CMS pages
- [ ] Non-authors are redirected
- [ ] Title and content fields work
- [ ] Rich text formatting works (bold, italic, headings, lists)
- [ ] Images can be uploaded
- [ ] Images appear in editor
- [ ] Draft can be saved
- [ ] Auto-save works
- [ ] Unsaved changes warning appears
- [ ] Saved drafts can be edited
- [ ] Slug is generated correctly
- [ ] Form validation works

---

## Security Considerations

### Access Control

- Only authors and admins can create articles
- Users can only edit their own articles
- Admin can edit any article
- RLS policies enforce access control

### Input Validation

- Validate title and content required
- Sanitize HTML content
- Validate image file types and sizes
- Prevent XSS in rich text content

### File Upload

- Validate file types (images only)
- Limit file sizes (5MB max)
- Generate unique filenames
- Use Supabase Storage security

---

## Accessibility

- Keyboard navigation in editor
- Proper ARIA labels for toolbar buttons
- Focus management
- Screen reader support for editor actions

---

## Next Steps

After completing Story 4.1:

### Story 4.2: Article Publishing & Scheduling

Implement publishing and scheduling functionality.

---

## References

- **Epic Definition**: `docs/epics.md` (Story 4.1)
- **Tiptap Documentation**: https://tiptap.dev/
- **Next.js File Upload**: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **Supabase Storage**: https://supabase.com/docs/guides/storage

---

## Implementation Notes

### Design Principles

1. **User Experience**: Fast, responsive editor
2. **Auto-Save**: Never lose work
3. **Simplicity**: Clean, distraction-free writing
4. **Flexibility**: Rich formatting options
5. **Security**: Proper access control

### Best Practices

- Use Tiptap for rich text editing
- Implement auto-save for drafts
- Warn users about unsaved changes
- Validate all inputs
- Use proper TypeScript types
- Follow existing code patterns
- Test thoroughly

---

🙏 May this CMS empower authors to share the Dhamma with the world.
