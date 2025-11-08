/**
 * ArticleContent Component
 * Story 3.1: Article Display & Reading Interface
 *
 * Renders markdown article content with sanitization and proper styling
 */

'use client';

import { useEffect, useRef } from 'react';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

interface ArticleContentProps {
  content: string;
}

export default function ArticleContent({ content }: ArticleContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current && content) {
      // Configure marked options
      marked.setOptions({
        gfm: true, // GitHub Flavored Markdown
        breaks: true, // Convert line breaks to <br>
      });

      // Convert markdown to HTML
      const rawHtml = marked(content);

      // Sanitize HTML to prevent XSS attacks
      const sanitizedHtml = DOMPurify.sanitize(rawHtml as string, {
        ALLOWED_TAGS: [
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'p',
          'br',
          'strong',
          'em',
          'u',
          'a',
          'ul',
          'ol',
          'li',
          'blockquote',
          'code',
          'pre',
          'img',
          'table',
          'thead',
          'tbody',
          'tr',
          'th',
          'td',
          'hr',
        ],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
      });

      // Set the sanitized content
      contentRef.current.innerHTML = sanitizedHtml;
    }
  }, [content]);

  return (
    <div
      ref={contentRef}
      className="article-content prose prose-lg max-w-none dark:prose-invert
        prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
        prose-p:text-gray-700 dark:prose-p:text-gray-300
        prose-p:leading-relaxed
        prose-a:text-blue-600 dark:prose-a:text-blue-400
        prose-a:no-underline hover:prose-a:underline
        prose-strong:text-gray-900 dark:prose-strong:text-white
        prose-em:text-gray-700 dark:prose-em:text-gray-300
        prose-code:rounded prose-code:bg-gray-100 dark:prose-code:bg-gray-800
        prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm
        prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800
        prose-pre:rounded-lg prose-pre:p-4
        prose-img:rounded-lg prose-img:shadow-md
        prose-blockquote:border-l-4 prose-blockquote:border-blue-500
        prose-blockquote:pl-4 prose-blockquote:italic
        prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300
        prose-ul:list-disc prose-ol:list-decimal
        prose-li:text-gray-700 dark:prose-li:text-gray-300
        prose-table:border-collapse prose-table:w-full
        prose-th:bg-gray-100 dark:prose-th:bg-gray-800
        prose-th:p-2 prose-th:text-left
        prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-700
        prose-td:p-2
        prose-hr:border-gray-300 dark:prose-hr:border-gray-700"
      style={{
        fontSize: 'var(--base-font-size, 16px)',
      }}
    />
  );
}
