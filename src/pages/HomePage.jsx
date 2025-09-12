import React, { useState, useEffect } from 'react'
import { postsService } from '../services/api.js'
import PostCard from '../components/ui/PostCard.jsx'
import { LoadingPage, LoadingCard, SkeletonCard } from '../components/ui/LoadingSpinner.jsx'
import ErrorMessage from '../components/ui/ErrorMessage.jsx'
import Button from '../components/ui/Button.jsx'
import DevelopmentNotice from '../components/ui/DevelopmentNotice.jsx'
import FeaturedPostsHighlight from '../components/FeaturedPostsHighlight.jsx'
import SkeletonFeaturedPost from '../components/ui/SkeletonFeaturedPost.jsx'

const HomePage = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  
  const POSTS_PER_PAGE = 6

  const fetchPosts = async (pageNum = 0, isLoadMore = false) => {
    try {
      if (!isLoadMore) setLoading(true)
      else setLoadingMore(true)
      
      setError(null)
      
      const offset = pageNum * POSTS_PER_PAGE
      const newPosts = await postsService.getPublished(POSTS_PER_PAGE, offset)
      
      if (isLoadMore) {
        setPosts(prevPosts => [...prevPosts, ...newPosts])
      } else {
        setPosts(newPosts)
      }
      
      // Check if there are more posts
      setHasMore(newPosts.length === POSTS_PER_PAGE)
      
    } catch (err) {
      console.error('Error fetching posts:', err)
      setError('Failed to load posts. Please try again.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchPosts(nextPage, true)
  }

  const handleRetry = () => {
    setPage(0)
    fetchPosts()
  }

  if (error && posts.length === 0) {
    return (
      <div className="container-main py-8">
        <ErrorMessage 
          message={error} 
          showRetry 
          onRetry={handleRetry}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <section className="bg-black py-12">
        <div className="container-main">
          {/* Featured Posts Highlight handles its own loading state */}
          <FeaturedPostsHighlight />
        </div>
      </section>

      {/* Latest Posts */}
      <section className="py-12 bg-[#f0f0f0]">
        <div className="container-main">
          <DevelopmentNotice />
          
          <div className="mb-8 relative">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 relative inline-block">
              Latest Posts
              <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-black via-gray-500 to-black"></span>
            </h2>
            <p className="text-gray-600">Stay up to date with our newest content</p>
          </div>

          {posts.length === 0 && !loading ? (
            <div className="text-center py-12 bg-white p-8 shadow-sm border border-gray-200">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600">Check back soon for new content!</p>
            </div>
          ) : (
            <>
              {/* Posts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {loading && posts.length === 0 ? (
                  // Skeleton loading for initial fetch
                  Array.from({ length: POSTS_PER_PAGE }).map((_, index) => (
                    <div key={`skeleton-${index}`} className="opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]" style={{ animationDelay: `${index * 0.1}s` }}>
                      <SkeletonCard />
                    </div>
                  ))
                ) : (
                  // Actual posts
                  posts.map((post, index) => (
                    <div key={post.id} className="opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]" style={{ animationDelay: `${index * 0.1}s` }}>
                      <PostCard post={post} />
                    </div>
                  ))
                )}
                
                {/* Loading cards for load more */}
                {loadingMore && Array.from({ length: 3 }).map((_, index) => (
                  <div key={`loading-more-${index}`} className="opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]" style={{ animationDelay: `${index * 0.1}s` }}>
                    <SkeletonCard />
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && !loadingMore && (
                <div className="text-center">
                  <Button
                    onClick={handleLoadMore}
                    variant="primary"
                    size="lg"
                    className="px-8 bg-black text-white border border-gray-400 hover:bg-gray-800"
                  >
                    Load More Posts
                  </Button>
                </div>
              )}

              {/* End of posts message */}
              {!hasMore && posts.length > POSTS_PER_PAGE && (
                <div className="text-center py-8 border-t border-gray-300 mt-8">
                  <p className="text-gray-600">You've reached the end! 🎉</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}

export default HomePage