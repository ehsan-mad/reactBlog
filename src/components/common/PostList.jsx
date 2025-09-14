import React from 'react'
import PostCard from './PostCard'
import Button from '../ui/Button'
import ErrorMessage from '../ui/ErrorMessage'
import { SkeletonCard } from '../ui/LoadingSpinner'

/**
 * A reusable component for displaying a list of posts with loading states and pagination
 * 
 * @param {Object} props - Component props
 * @param {Array} props.posts - Array of post objects
 * @param {boolean} props.loading - Whether the initial posts are loading
 * @param {boolean} props.loadingMore - Whether additional posts are being loaded
 * @param {string} props.error - Error message, if any
 * @param {boolean} props.hasMore - Whether there are more posts to load
 * @param {Function} props.onLoadMore - Function to call when loading more posts
 * @param {Function} props.onRetry - Function to call when retrying after an error
 * @param {string} props.emptyMessage - Message to show when there are no posts
 * @param {string} props.endMessage - Message to show when all posts have been loaded
 * @param {string} props.layout - Layout style ('grid' or 'list')
 * @param {number} props.columns - Number of columns in the grid (1-4)
 * @param {string} props.cardVariant - Card variant to use ('default', 'compact', 'featured')
 * @returns {JSX.Element} Post list component
 */
const PostList = ({
  posts = [],
  loading = false,
  loadingMore = false,
  error = null,
  hasMore = false,
  onLoadMore,
  onRetry,
  emptyMessage = "No posts available",
  endMessage = "You've reached the end! 🎉",
  layout = 'grid',
  columns = 3,
  cardVariant = 'default'
}) => {
  const isList = layout === 'list'
  
  // Determine grid columns based on props
  let gridCols = 'grid-cols-1'
  if (!isList) {
    switch (columns) {
      case 1:
        gridCols = 'grid-cols-1'
        break
      case 2:
        gridCols = 'grid-cols-1 md:grid-cols-2'
        break
      case 3:
        gridCols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        break
      case 4:
        gridCols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
        break
      default:
        gridCols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    }
  }

  // Helper to render loading placeholders
  const renderSkeletons = (count = 3) => {
    return Array.from({ length: count }).map((_, index) => (
      <div 
        key={`skeleton-${index}`} 
        className="opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]" 
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <SkeletonCard />
      </div>
    ))
  }

  // If there's an error and no posts, show error message
  if (error && posts.length === 0) {
    return (
      <ErrorMessage 
        message={error} 
        showRetry={!!onRetry} 
        onRetry={onRetry}
      />
    )
  }

  // If loading and no posts, show loading skeletons
  if (loading && posts.length === 0) {
    return (
      <div className={`${isList ? 'space-y-6' : `grid ${gridCols} gap-6`} mb-8`}>
        {renderSkeletons(isList ? 3 : columns * 2)}
      </div>
    )
  }

  // If no posts and not loading, show empty message
  if (posts.length === 0 && !loading) {
    return (
      <div className="text-center py-12 bg-white p-8 shadow-sm border border-gray-200 rounded-lg">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <>
      {/* Posts Layout - Either Grid or List */}
      <div className={`${isList ? 'space-y-6' : `grid ${gridCols} gap-6`} mb-8`}>
        {/* Render the posts */}
        {posts.map((post, index) => (
          <div 
            key={post.id} 
            className="opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]" 
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <PostCard 
              post={post} 
              variant={cardVariant} 
            />
          </div>
        ))}
        
        {/* Loading placeholders for load more */}
        {loadingMore && renderSkeletons(isList ? 1 : columns)}
      </div>

      {/* Load More Button */}
      {hasMore && !loadingMore && onLoadMore && (
        <div className="text-center">
          <Button
            onClick={onLoadMore}
            variant="primary"
            size="lg"
            className="px-8 bg-black text-white border border-gray-400 hover:bg-gray-800"
          >
            Load More Posts
          </Button>
        </div>
      )}

      {/* End of posts message */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8 border-t border-gray-300 mt-8">
          <p className="text-gray-600">{endMessage}</p>
        </div>
      )}
    </>
  )
}

export default PostList