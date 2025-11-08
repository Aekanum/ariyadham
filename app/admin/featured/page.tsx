'use client';

import { useEffect, useState, useCallback } from 'react';
import RoleGuard from '@/components/auth/RoleGuard';
import { Star, X, GripVertical } from 'lucide-react';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  category: string | null;
  published_at: string;
}

interface FeaturedArticle {
  id: string;
  article_id: string;
  display_order: number;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  category: string | null;
  published_at: string;
}

export default function FeaturedContentPage() {
  const [featuredArticles, setFeaturedArticles] = useState<FeaturedArticle[]>([]);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch featured articles
      const featuredRes = await fetch('/api/admin/featured');
      const featuredData = await featuredRes.json();
      if (featuredData.success) {
        setFeaturedArticles(featuredData.data);
      }

      // Fetch all published articles for selection
      const articlesRes = await fetch('/api/articles?status=published&limit=100');
      const articlesData = await articlesRes.json();
      if (articlesData.success) {
        setAllArticles(articlesData.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddFeatured = async (articleId: string) => {
    try {
      const response = await fetch('/api/admin/featured', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleId }),
      });

      const data = await response.json();

      if (data.success) {
        fetchData(); // Refresh data
      } else {
        alert(data.error?.message || 'Failed to add featured article');
      }
    } catch (error) {
      console.error('Failed to add featured article:', error);
      alert('Failed to add featured article');
    }
  };

  const handleRemoveFeatured = async (featuredId: string) => {
    if (!confirm('Remove this article from featured?')) return;

    try {
      const response = await fetch(`/api/admin/featured/${featuredId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchData(); // Refresh data
      } else {
        alert(data.error?.message || 'Failed to remove featured article');
      }
    } catch (error) {
      console.error('Failed to remove featured article:', error);
      alert('Failed to remove featured article');
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newFeatured = [...featuredArticles];
    const draggedItem = newFeatured[draggedIndex];
    newFeatured.splice(draggedIndex, 1);
    newFeatured.splice(index, 0, draggedItem);

    setFeaturedArticles(newFeatured);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null) return;

    // Update order on server
    const orderedIds = featuredArticles.map((f) => f.id);
    try {
      const response = await fetch('/api/admin/featured/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderedIds }),
      });

      const data = await response.json();

      if (data.success) {
        setFeaturedArticles(data.data);
      } else {
        alert('Failed to reorder featured articles');
        fetchData(); // Revert to server state
      }
    } catch (error) {
      console.error('Failed to reorder:', error);
      fetchData(); // Revert to server state
    }

    setDraggedIndex(null);
  };

  // Filter articles that are not already featured
  const availableArticles = allArticles.filter((article) => {
    const isFeatured = featuredArticles.some((f) => f.article_id === article.id);
    const matchesSearch =
      searchQuery.trim() === '' || article.title.toLowerCase().includes(searchQuery.toLowerCase());
    return !isFeatured && matchesSearch;
  });

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Featured Content Management</h1>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Featured Articles Section */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">
              Featured Articles ({featuredArticles.length}/10)
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              Drag and drop to reorder. These articles will appear on the homepage.
            </p>

            {loading ? (
              <p>Loading...</p>
            ) : featuredArticles.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
                No featured articles yet. Add articles from the right panel.
              </div>
            ) : (
              <div className="space-y-2">
                {featuredArticles.map((featured, index) => (
                  <div
                    key={featured.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex cursor-move items-center gap-3 rounded-lg border bg-white p-4 transition-all hover:shadow-md ${
                      draggedIndex === index ? 'opacity-50' : ''
                    }`}
                  >
                    <GripVertical className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      </div>
                      <h3 className="font-semibold">{featured.title}</h3>
                      {featured.excerpt && (
                        <p className="line-clamp-2 text-sm text-gray-600">{featured.excerpt}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        {featured.category} • {new Date(featured.published_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveFeatured(featured.id)}
                      className="rounded p-2 text-red-600 hover:bg-red-50"
                      title="Remove from featured"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Articles Section */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">Add Articles</h2>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-2"
            />

            {loading ? (
              <p>Loading...</p>
            ) : availableArticles.length === 0 ? (
              <p className="text-gray-500">No articles available</p>
            ) : (
              <div className="max-h-[600px] space-y-2 overflow-y-auto">
                {availableArticles.map((article) => (
                  <div
                    key={article.id}
                    className="flex items-center gap-3 rounded-lg border bg-white p-4"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{article.title}</h3>
                      {article.excerpt && (
                        <p className="line-clamp-2 text-sm text-gray-600">{article.excerpt}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        {article.category} • {new Date(article.published_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAddFeatured(article.id)}
                      disabled={featuredArticles.length >= 10}
                      className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                      title={
                        featuredArticles.length >= 10
                          ? 'Maximum featured articles reached'
                          : 'Add to featured'
                      }
                    >
                      <Star className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
