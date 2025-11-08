import ApplyAuthorForm from '@/components/author/ApplyAuthorForm';

export default function ApplyAuthorPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Apply to Become an Author</h1>

      <div className="mb-6 rounded-lg bg-blue-50 p-4">
        <h2 className="mb-2 text-lg font-semibold">About Author Applications</h2>
        <p className="mb-2 text-sm text-gray-700">
          We welcome passionate individuals who want to share dharma teachings with our community.
          As an author, you will be able to:
        </p>
        <ul className="ml-4 list-disc text-sm text-gray-700">
          <li>Create and publish articles</li>
          <li>Share your insights on Buddhist teachings</li>
          <li>Engage with readers through comments</li>
          <li>Build a following within the community</li>
        </ul>
      </div>

      <div className="mb-6 rounded-lg bg-yellow-50 p-4">
        <h2 className="mb-2 text-lg font-semibold">Application Guidelines</h2>
        <ul className="ml-4 list-disc text-sm text-gray-700">
          <li>Provide detailed information about your background and experience with dharma</li>
          <li>Explain your motivation for wanting to share teachings on our platform</li>
          <li>Include writing samples if available (links or text samples are welcome)</li>
          <li>Applications are reviewed by our admin team, usually within 3-5 business days</li>
          <li>You will be notified of the decision via email</li>
        </ul>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <ApplyAuthorForm />
      </div>
    </div>
  );
}
