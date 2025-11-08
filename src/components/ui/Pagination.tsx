'use client';

import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export default function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const showPages = pages.filter((page) => {
    // Always show first, last, current, and adjacent pages
    return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
  });

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link
          href={`${baseUrl}?page=${currentPage - 1}`}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Previous
        </Link>
      ) : (
        <span className="cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm font-medium text-gray-400 dark:border-gray-600 dark:bg-gray-700">
          Previous
        </span>
      )}

      {/* Page Numbers */}
      {showPages.map((page, index) => {
        // Add ellipsis if there's a gap
        const prevPage = showPages[index - 1];
        const showEllipsis = prevPage && page - prevPage > 1;

        return (
          <div key={page} className="flex items-center gap-2">
            {showEllipsis && <span className="px-2 text-gray-500 dark:text-gray-400">...</span>}
            {page === currentPage ? (
              <span className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white">
                {page}
              </span>
            ) : (
              <Link
                href={`${baseUrl}?page=${page}`}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {page}
              </Link>
            )}
          </div>
        );
      })}

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link
          href={`${baseUrl}?page=${currentPage + 1}`}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Next
        </Link>
      ) : (
        <span className="cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm font-medium text-gray-400 dark:border-gray-600 dark:bg-gray-700">
          Next
        </span>
      )}
    </nav>
  );
}
