'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ApplyAuthorForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    bio: '',
    credentials: '',
    writing_samples: '',
    motivation: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/author-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to submit application');
      }

      // Redirect to application status page
      router.push('/author/application/status');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="bio" className="block text-sm font-medium">
          Bio (100-1000 characters)
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          required
          minLength={100}
          maxLength={1000}
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          placeholder="Tell us about yourself..."
        />
        <p className="mt-1 text-sm text-gray-500">{formData.bio.length}/1000 characters</p>
      </div>

      <div>
        <label htmlFor="credentials" className="block text-sm font-medium">
          Credentials & Experience (50-2000 characters)
        </label>
        <textarea
          id="credentials"
          name="credentials"
          rows={4}
          required
          minLength={50}
          maxLength={2000}
          value={formData.credentials}
          onChange={(e) => setFormData({ ...formData, credentials: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          placeholder="Your background, education, experience with dharma..."
        />
        <p className="mt-1 text-sm text-gray-500">{formData.credentials.length}/2000 characters</p>
      </div>

      <div>
        <label htmlFor="writing_samples" className="block text-sm font-medium">
          Writing Samples (optional)
        </label>
        <textarea
          id="writing_samples"
          name="writing_samples"
          rows={3}
          value={formData.writing_samples}
          onChange={(e) => setFormData({ ...formData, writing_samples: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          placeholder="Links to your writing or sample text..."
        />
      </div>

      <div>
        <label htmlFor="motivation" className="block text-sm font-medium">
          Why do you want to become an author? (100-1000 characters)
        </label>
        <textarea
          id="motivation"
          name="motivation"
          rows={4}
          required
          minLength={100}
          maxLength={1000}
          value={formData.motivation}
          onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          placeholder="What motivates you to share dharma with others?"
        />
        <p className="mt-1 text-sm text-gray-500">{formData.motivation.length}/1000 characters</p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Application'}
      </button>
    </form>
  );
}
