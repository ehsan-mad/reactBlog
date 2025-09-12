import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { postsService, engagementService } from '../services/api.js'
import { getCoverImageUrl, getImageFallback } from '../utils/imageUtils.js'
import { getCategoryColorClasses } from '../utils/colorUtils.js'
import PostCard from '../components/ui/PostCard.jsx'
import { LoadingPage } from '../components/ui/LoadingSpinner.jsx'
import { ErrorPage } from '../components/ui/ErrorMessage.jsx'
import Button from '../components/ui/Button.jsx'
import Toast from '../components/ui/Toast.jsx'
import { signInAnonymously } from '../services/supabase.js'
import Markdown from '../components/ui/Markdown.jsx'

const PostPage = () => {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [relatedPosts, setRelatedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [viewCount, setViewCount] = useState(0)
  const [toast, setToast] = useState(null)
  // Using localStorage for like state; backend toggle is anonymous-safe

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch the post
        const postData = await postsService.getBySlug(slug)
        
        if (!postData) {
          setError('Post not found')
          return
        }

        setPost(postData)
        // Get authoritative like count from DB (via likes table)
        try {
          const countFromDb = await engagementService.getLikes(postData.id)
          if (typeof countFromDb === 'number' && Number.isFinite(countFromDb)) {
            setLikeCount(countFromDb)
          } else {
            setLikeCount(postData.likes || 0)
          }
        } catch (e) {
          console.warn('Failed to fetch like count from DB, using post.likes fallback', e)
          setLikeCount(postData.likes || 0)
        }
        setViewCount(postData.views || 0)

        // Track view if not already viewed in this session
        const viewedPosts = JSON.parse(sessionStorage.getItem('viewedPosts') || '[]')
        if (!viewedPosts.includes(postData.id)) {
          // Increment view count
          await postsService.incrementViews(postData.id)
          
          // Update local state
          setViewCount(prev => prev + 1)
          
          // Mark as viewed in session
          viewedPosts.push(postData.id)
          sessionStorage.setItem('viewedPosts', JSON.stringify(viewedPosts))
        }

        // Determine initial liked state: prefer DB check with guest id
        try {
          const auth = await signInAnonymously()
          const userId = auth?.user?.id
          if (userId) {
            // Check if row exists in likes for (post_id, user_id)
            const hasLiked = await engagementService.hasLiked(postData.id, userId)
            const likedFromDb = Boolean(hasLiked)
            setLiked(likedFromDb)
            // Keep localStorage in sync for consistent UX
            try {
              const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]')
              const exists = likedPosts.includes(postData.id)
              if (likedFromDb && !exists) {
                likedPosts.push(postData.id)
                localStorage.setItem('likedPosts', JSON.stringify(likedPosts))
              } else if (!likedFromDb && exists) {
                const filtered = likedPosts.filter(id => id !== postData.id)
                localStorage.setItem('likedPosts', JSON.stringify(filtered))
              }
            } catch {
              // ignore localStorage sync errors
            }
          } else {
            const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]')
            setLiked(likedPosts.includes(postData.id))
          }
        } catch {
          const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]')
          setLiked(likedPosts.includes(postData.id))
        }

        // Optional: could use guest auth for per-user tracking; we keep localStorage for simplicity

        // Fetch related posts
        if (postData.category_id) {
          const related = await postsService.getRelated(postData.category_id, postData.id, 3)
          setRelatedPosts(related)
        }

      } catch (err) {
        console.error('Error fetching post:', err)
        setError('Failed to load post')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchPost()
    }
  }, [slug])

  const handleLike = async () => {
    if (!post) return

    try {
      // Determine current like status from state (authoritative)
      const isCurrentlyLiked = liked
      const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]')

      // Optimistic UI update + local storage persistence
      if (isCurrentlyLiked) {
        const updatedLikes = likedPosts.filter(id => id !== post.id)
        localStorage.setItem('likedPosts', JSON.stringify(updatedLikes))
        setLiked(false)
        setLikeCount(prev => Math.max(0, prev - 1))
      } else {
        if (!likedPosts.includes(post.id)) {
          likedPosts.push(post.id)
          localStorage.setItem('likedPosts', JSON.stringify(likedPosts))
        }
        setLiked(true)
        setLikeCount(prev => prev + 1)
      }

      // Notify backend (if configured) to toggle like count
      // If service returns a numeric count, reconcile UI to server state
      engagementService
        .toggleLike(post.id, isCurrentlyLiked)
        .then((maybeCount) => {
          if (typeof maybeCount === 'number' && Number.isFinite(maybeCount)) {
            setLikeCount(maybeCount)
          }
        })
        .catch((err) => {
          console.warn('toggleLike failed; keeping optimistic UI state', err)
          setToast('Unable to save like right now. Your change may not persist.')
        })
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return <LoadingPage message="Loading post..." />
  }

  if (error || !post) {
    return <ErrorPage title="Post Not Found" message={error || "The post you're looking for doesn't exist."} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      {/* Cover Image */}
      {post.cover_path && (
        <div className="w-full h-64 md:h-96 bg-gray-200 overflow-hidden">
          <img
            src={getCoverImageUrl(post.cover_path, post.title)}
            alt={post.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = getImageFallback();
            }}
          />
        </div>
      )}

      {/* Post Content */}
      <article className="container-main py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            {/* Category Badge */}
            {post.categories && (
              <div className="mb-4">
                <span className={`inline-block text-sm font-medium px-3 py-1 rounded-md ${getCategoryColorClasses(post.categories.name)}`}>
                  {post.categories.name}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {post.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center justify-between text-sm text-gray-600 mb-6">
              <time dateTime={post.published_at} className="mb-2 md:mb-0">
                Published on {formatDate(post.published_at)}
              </time>

              {/* Views and Likes */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{viewCount} views</span>
                </div>

                <Button
                  onClick={handleLike}
                  variant="ghost"
                  size="sm"
                  className={`flex items-center space-x-1 ${liked ? 'text-red-600' : 'text-gray-600'}`}
                >
                  <svg className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{likeCount}</span>
                </Button>
              </div>
            </div>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-lg text-gray-700 leading-relaxed bg-gray-100 p-4 rounded-lg italic">
                {post.excerpt}
              </p>
            )}
          </header>

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-12 text-gray-800 leading-relaxed">
            {post.content && <Markdown>{post.content}</Markdown>}
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-white py-12 border-t border-gray-200">
          <div className="container-main">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">More from {post.categories?.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <PostCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default PostPage