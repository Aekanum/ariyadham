import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md text-center">
        <div className="rounded-lg bg-white p-8 shadow dark:bg-gray-800">
          {/* Icon */}
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
              <svg
                className="h-12 w-12 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            Access Denied
          </h1>

          {/* Message */}
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            You don&apos;t have permission to access this page. Please contact
            an administrator if you believe this is an error.
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Go Home
            </Link>
            <Link
              href="/login"
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
