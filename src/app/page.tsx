// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">🙏 Ariyadham</h1>
        <p className="text-xl text-gray-600 mb-8">
          A modern platform for sharing Buddhist teachings (dharma)
        </p>

        <div className="bg-blue-50 p-8 rounded-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">Welcome, Developer! 👋</h2>
          <p className="text-gray-700 mb-4">
            You&rsquo;ve successfully initialized the Ariyadham project with Next.js, TypeScript,
            and Tailwind CSS.
          </p>
          <p className="text-gray-700 mb-4">
            This is the home page. Start building by editing{' '}
            <code className="bg-gray-200 px-2 py-1 rounded">src/app/page.tsx</code>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="border border-gray-300 p-6 rounded-lg">
            <h3 className="font-semibold mb-2">📚 Getting Started</h3>
            <p className="text-sm text-gray-600">
              Read the architecture and epic documentation to understand the project structure.
            </p>
          </div>

          <div className="border border-gray-300 p-6 rounded-lg">
            <h3 className="font-semibold mb-2">🔧 Development</h3>
            <p className="text-sm text-gray-600">
              Run <code className="bg-gray-200 px-1">npm run dev</code> to start the development
              server.
            </p>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          <p>Project Status: Foundation Setup (Story 1.1)</p>
          <p>Next: Database Schema (Story 1.2)</p>
        </div>
      </div>
    </main>
  );
}
