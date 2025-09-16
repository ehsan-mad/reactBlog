import React from 'react'
import { useParams } from 'react-router-dom'
import PostCard from '../components/common/PostCard.jsx'
import { SkeletonCard } from '../components/ui/LoadingSpinner.jsx'
import { ErrorPage } from '../components/ui/ErrorMessage.jsx'
import Button from '../components/ui/Button.jsx'
import { useCategoryPosts } from '../hooks/useBlog.js'

/**
 * CategoryPage component - Displays all posts in a specific category
 */
const CategoryPage = () => {
  const { slug } = useParams()
  const {
    posts,
    category,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    retry
  } = useCategoryPosts(slug, 6)

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-r from-gray-800 to-black text-white py-16">
          <div className="container-main text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-pulse">
              Loading category...
            </h1>
          </div>
        </section>
        
        <section className="py-12">
          <div className="container-main">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={`skeleton-${index}`} />
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (error && posts.length === 0) {
    return <ErrorPage 
      title="Category Not Found" 
      message={error}
      actionLabel="Try Again"
      onAction={retry}
    />
  }

  if (!category && !loading) {
    return <ErrorPage 
      title="Category Not Found" 
      message="The category you're looking for doesn't exist."
      actionLabel="Go Back to Homepage"
      actionPath="/"
    />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Header */}
      <section className="bg-gradient-to-r from-gray-800 to-black text-white py-16">
        <div className="container-main text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {category.name}
          </h1>
          <p className="text-xl text-gray-300">
            Explore all posts in {category.name}
          </p>
        </div>
      </section>

      {/* Posts Section */}
      <section className="py-12">
        <div className="container-main">
          {posts.length === 0 && !loading ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📂</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts in this category yet</h3>
              <p className="text-gray-600">Check back soon for new content in {category.name}!</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {posts.length} {posts.length === 1 ? 'Post' : 'Posts'} in {category.name}
                </h2>
              </div>

              {/* Posts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} variant="default" />
                ))}
                
                {/* Loading cards for load more */}
                {loadingMore && Array.from({ length: 3 }).map((_, index) => (
                  <SkeletonCard key={`loading-${index}`} />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && !loadingMore && (
                <div className="text-center">
                  <Button
                    onClick={loadMore}
                    variant="outline"
                    size="lg"
                    className="px-8"
                  >
                    Load More Posts
                  </Button>
                </div>
              )}

              {/* End of posts message */}
              {!hasMore && posts.length > 6 && (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    You've seen all posts in {category.name}! 🎉
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}

export default CategoryPage