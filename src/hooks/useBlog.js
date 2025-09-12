/**
 * Blog Application Custom Hooks
 * 
 * This file contains all the custom hooks for managing blog data and user interactions.
 * Each hook encapsulates specific functionality to make components cleaner and more focused.
 */

import { useState, useEffect, useCallback } from 'react'
import { postsService, categoriesService, engagementService } from '../services/api.js'

/**
 * Hook for fetching and managing posts with pagination
 * 
 * @param {number} initialLimit - Number of posts to fetch per page
 * @returns {Object} Post data and control functions
 */
export const usePosts = (initialLimit = 6) => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)

  const fetchPosts = useCallback(async (pageNum = 0, isLoadMore = false) => {
    try {
      if (!isLoadMore) setLoading(true)
      else setLoadingMore(true)
      
      setError(null)
      
      const offset = pageNum * initialLimit
      const newPosts = await postsService.getPublished(initialLimit, offset)
      
      if (isLoadMore) {
        setPosts(prevPosts => [...prevPosts, ...newPosts])
      } else {
        setPosts(newPosts)
      }
      
      setHasMore(newPosts.length === initialLimit)
      
    } catch (err) {
      console.error('Error fetching posts:', err)
      setError('Failed to load posts')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [initialLimit])

  const loadMore = useCallback(() => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchPosts(nextPage, true)
  }, [page, fetchPosts])

  const retry = useCallback(() => {
    setPage(0)
    fetchPosts()
  }, [fetchPosts])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  return {
    posts,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    retry
  }
}

/**
 * Hook for fetching and managing a single post by slug
 * 
 * @param {string} slug - The post slug to fetch
 * @returns {Object} Post data, loading and error states
 */
export const usePost = (slug) => {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return

      try {
        setLoading(true)
        setError(null)

        const postData = await postsService.getBySlug(slug)
        
        if (!postData) {
          setError('Post not found')
          return
        }

        setPost(postData)
      } catch (err) {
        console.error('Error fetching post:', err)
        setError('Failed to load post')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [slug])

  return { post, loading, error }
}

/**
 * Hook for fetching and managing categories
 * 
 * @returns {Object} Categories data, loading and error states
 */
export const useCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const data = await categoriesService.getAll()
        setCategories(data)
      } catch (err) {
        console.error('Error fetching categories:', err)
        setError('Failed to load categories')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
}

/**
 * Hook for managing post engagement (views/likes)
 * Uses local storage for anonymous users and can integrate with backend
 * 
 * @param {Object} post - The post object
 * @returns {Object} Engagement data and control functions
 */
export const usePostEngagement = (post) => {
  const [viewCount, setViewCount] = useState(post?.views || 0)
  const [likeCount, setLikeCount] = useState(post?.likes || 0)
  const [liked, setLiked] = useState(false)
  const [viewed, setViewed] = useState(false)

  // Check if post was already viewed/liked
  useEffect(() => {
    if (!post) return

    const viewedPosts = JSON.parse(sessionStorage.getItem('viewedPosts') || '[]')
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]')
    
    setViewed(viewedPosts.includes(post.id))
    setLiked(likedPosts.includes(post.id))
    setViewCount(post.views || 0)
    setLikeCount(post.likes || 0)
  }, [post])

  // Track view once
  const trackView = useCallback(async () => {
    if (!post || viewed) return

    try {
      await postsService.incrementViews(post.id)
      setViewCount(prev => prev + 1)
      setViewed(true)

      // Store in session storage
      const viewedPosts = JSON.parse(sessionStorage.getItem('viewedPosts') || '[]')
      viewedPosts.push(post.id)
      sessionStorage.setItem('viewedPosts', JSON.stringify(viewedPosts))
    } catch (error) {
      console.error('Error tracking view:', error)
    }
  }, [post, viewed])

  // Toggle like
  const toggleLike = useCallback(async () => {
    if (!post) return

    try {
      // Use the engagementService for likes
      const newLikeCount = await engagementService.toggleLike(post.id, liked)
      
      // Update local state
      const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]')
      
      if (liked) {
        // Remove from liked posts
        const updatedLikes = likedPosts.filter(id => id !== post.id)
        localStorage.setItem('likedPosts', JSON.stringify(updatedLikes))
        setLiked(false)
        setLikeCount(prev => Math.max(0, prev - 1))
      } else {
        // Add to liked posts
        likedPosts.push(post.id)
        localStorage.setItem('likedPosts', JSON.stringify(likedPosts))
        setLiked(true)
        setLikeCount(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }, [post, liked])

  return {
    viewCount,
    likeCount,
    liked,
    viewed,
    trackView,
    toggleLike
  }
}

/**
 * Hook for fetching posts by category
 * 
 * @param {string} categorySlug - The category slug to filter posts by
 * @param {number} initialLimit - Number of posts to fetch per page
 * @returns {Object} Category posts data and control functions
 */
export const useCategoryPosts = (categorySlug, initialLimit = 6) => {
  const [posts, setPosts] = useState([])
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)

  const fetchCategoryPosts = useCallback(async (pageNum = 0, isLoadMore = false) => {
    if (!categorySlug) return

    try {
      if (!isLoadMore) setLoading(true)
      else setLoadingMore(true)
      
      setError(null)
      
      // Get category info if not loaded yet
      let categoryData = category;
      if (!categoryData) {
        categoryData = await categoriesService.getBySlug(categorySlug)
        if (!categoryData) {
          setError('Category not found')
          setCategory(null) // Explicitly set to null on error
          setLoading(false)
          setLoadingMore(false)
          return
        }
        setCategory(categoryData)
      }
      
      const offset = pageNum * initialLimit
      const newPosts = await postsService.getByCategory(categorySlug, initialLimit, offset)
      
      if (isLoadMore) {
        setPosts(prevPosts => [...prevPosts, ...newPosts])
      } else {
        setPosts(newPosts)
      }
      
      setHasMore(newPosts.length === initialLimit)
      
    } catch (err) {
      console.error(`Error fetching posts for category "${categorySlug}":`, err)
      setError('Failed to load category posts')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [categorySlug, category, initialLimit])

  const loadMore = useCallback(() => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchCategoryPosts(nextPage, true)
  }, [page, fetchCategoryPosts])

  const retry = useCallback(() => {
    setPage(0)
    fetchCategoryPosts()
  }, [fetchCategoryPosts])

  useEffect(() => {
    // Don't reset category immediately to prevent UI flashing
    setPage(0)
    setPosts([])
    setLoading(true)
    // Only after fetching completes will category be updated
    fetchCategoryPosts()
  }, [categorySlug, fetchCategoryPosts])

  return {
    posts,
    category,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    retry
  }
}

/**
 * Hook for fetching featured posts
 * 
 * @param {number} limit - Number of featured posts to fetch
 * @returns {Object} Featured posts data and states
 */
export const useFeaturedPosts = (limit = 5) => {
  const [featuredPosts, setFeaturedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const posts = await postsService.getPublished(limit, 0)
        setFeaturedPosts(posts)
      } catch (err) {
        console.error('Error fetching featured posts:', err)
        setError('Failed to load featured posts')
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedPosts()
  }, [limit])

  return { featuredPosts, loading, error }
}

/**
 * Hook for managing blog posts in the admin panel
 * 
 * @returns {Object} Admin post management functions and state
 */
export const useAdminPosts = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingAction, setLoadingAction] = useState(false)
  const [error, setError] = useState(null)
  const [actionMessage, setActionMessage] = useState(null)

  // Fetch all posts for admin
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const allPosts = await postsService.getAll()
        setPosts(allPosts)
      } catch (err) {
        console.error('Error fetching posts for admin:', err)
        setError('Failed to load posts. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  // Create a new post
  const createPost = async (postData) => {
    try {
      setLoadingAction(true)
      setError(null)
      setActionMessage(null)
      
      const newPost = await postsService.create(postData)
      setPosts(prevPosts => [newPost, ...prevPosts])
      setActionMessage('Post created successfully!')
      
      return newPost
    } catch (err) {
      console.error('Error creating post:', err)
      setError('Failed to create post. Please try again.')
      return null
    } finally {
      setLoadingAction(false)
    }
  }

  // Update an existing post
  const updatePost = async (id, postData) => {
    try {
      setLoadingAction(true)
      setError(null)
      setActionMessage(null)
      
      const updatedPost = await postsService.update(id, postData)
      setPosts(prevPosts => 
        prevPosts.map(post => post.id === id ? updatedPost : post)
      )
      setActionMessage('Post updated successfully!')
      
      return updatedPost
    } catch (err) {
      console.error(`Error updating post ${id}:`, err)
      setError('Failed to update post. Please try again.')
      return null
    } finally {
      setLoadingAction(false)
    }
  }

  // Delete a post
  const deletePost = async (id) => {
    try {
      setLoadingAction(true)
      setError(null)
      setActionMessage(null)
      
      await postsService.delete(id)
      setPosts(prevPosts => prevPosts.filter(post => post.id !== id))
      setActionMessage('Post deleted successfully!')
      
      return true
    } catch (err) {
      console.error(`Error deleting post ${id}:`, err)
      setError('Failed to delete post. Please try again.')
      return false
    } finally {
      setLoadingAction(false)
    }
  }

  // Publish or unpublish a post
  const togglePublishStatus = async (id, currentStatus) => {
    try {
      setLoadingAction(true)
      setError(null)
      setActionMessage(null)
      
      const newStatus = !currentStatus
      const updatedPost = await postsService.update(id, { published: newStatus })
      
      setPosts(prevPosts => 
        prevPosts.map(post => post.id === id ? updatedPost : post)
      )
      
      setActionMessage(
        `Post ${newStatus ? 'published' : 'unpublished'} successfully!`
      )
      
      return updatedPost
    } catch (err) {
      console.error(`Error toggling publish status for post ${id}:`, err)
      setError('Failed to update publish status. Please try again.')
      return null
    } finally {
      setLoadingAction(false)
    }
  }

  // Clear any action messages or errors
  const clearMessages = () => {
    setActionMessage(null)
    setError(null)
  }

  return {
    posts,
    loading,
    loadingAction,
    error,
    actionMessage,
    createPost,
    updatePost,
    deletePost,
    togglePublishStatus,
    clearMessages
  }
}