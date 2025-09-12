/**
 * API Service Module - Provides data access to the blog application
 * 
 * Features:
 * - Abstracts data fetching from components
 * - Handles Supabase API calls
 * - Provides fallback to mock data when Supabase is not configured
 * - Centralizes error handling
 */

import { supabase, signInAnonymously } from './supabase.js'
import { mockCategories, mockPosts } from '../utils/mockData.js'

/**
 * Check if Supabase is properly configured
 * @returns {boolean} True if Supabase environment variables are set
 */
const isSupabaseConfigured = () => {
  return import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
}

/**
 * Categories Service - Manages blog categories data
 */
export const categoriesService = {
  /**
   * Get all categories for navigation
   * @returns {Promise<Array>} List of all categories
   */
  async getAll() {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, using mock data')
      return mockCategories
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching categories:', error)
      return mockCategories // Fallback to mock data
    }
  },

  /**
   * Get category by slug
   * @param {string} slug - The category slug to find
   * @returns {Promise<Object|null>} Category data or null if not found
   */
  async getBySlug(slug) {
    if (!isSupabaseConfigured()) {
      return mockCategories.find(cat => cat.slug === slug) || null
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error(`Error fetching category with slug "${slug}":`, error)
      // Return mock category that matches the slug
      return mockCategories.find(cat => cat.slug === slug) || null
    }
  }
}

/**
 * Posts Service - Manages blog posts data
 */
export const postsService = {
  /**
   * Get published posts with pagination
   * @param {number} limit - Maximum number of posts to fetch
   * @param {number} offset - Number of posts to skip (for pagination)
   * @returns {Promise<Array>} List of published posts
   */
  async getPublished(limit = 10, offset = 0) {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, using mock data')
      return mockPosts.slice(offset, offset + limit)
    }
    
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          categories (*)
        `)
        // Removed status filter since the column doesn't exist
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching published posts:', error)
      return mockPosts.slice(offset, offset + limit)
    }
  },

  /**
   * Get a single post by its slug
   * @param {string} slug - The post slug to find
   * @returns {Promise<Object|null>} Post data or null if not found
   */
  async getBySlug(slug) {
    if (!isSupabaseConfigured()) {
      return mockPosts.find(post => post.slug === slug) || null
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          categories (*)
        `)
        .eq('slug', slug)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error(`Error fetching post with slug "${slug}":`, error)
      return mockPosts.find(post => post.slug === slug) || null
    }
  },

  /**
   * Get posts by category
   * @param {string} categorySlug - The category slug to filter by
   * @param {number} limit - Maximum number of posts to fetch
   * @param {number} offset - Number of posts to skip (for pagination)
   * @returns {Promise<Array>} List of posts in the category
   */
  async getByCategory(categorySlug, limit = 10, offset = 0) {
    if (!isSupabaseConfigured()) {
      // Filter mock posts by category
      const categoryPosts = mockPosts.filter(post => 
        post.categories && post.categories.slug === categorySlug
      )
      return categoryPosts.slice(offset, offset + limit)
    }

    try {
      // First, get the category ID from the slug
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single()

      if (categoryError) throw categoryError
      
      // Then get posts with that category ID
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          categories (*)
        `)
        .eq('category_id', category.id)
        // Removed status filter since the column doesn't exist
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error(`Error fetching posts for category "${categorySlug}":`, error)
      // Return mock posts filtered by category
      const categoryPosts = mockPosts.filter(post => 
        post.categories && post.categories.slug === categorySlug
      )
      return categoryPosts.slice(offset, offset + limit)
    }
  },
  
  /**
   * Update post view count
   * @param {string} postId - The ID of the post to update
   * @returns {Promise<boolean>} Success status
   */
  async incrementViews(postId) {
    if (!isSupabaseConfigured()) {
      // In mock mode, just simulate a successful update
      return true
    }

    try {
      // First get the current view count
      const { data: post, error: fetchError } = await supabase
        .from('posts')
        .select('views')
        .eq('id', postId)
        .single()
      
      if (fetchError) throw fetchError
      
      // Then update with incremented value
      const { error: updateError } = await supabase
        .from('posts')
        .update({ views: (post.views || 0) + 1 })
        .eq('id', postId)
      
      if (updateError) throw updateError
      return true
    } catch (error) {
      console.error(`Error incrementing views for post "${postId}":`, error)
      return false
    }
  },

  /**
   * Get related posts from the same category
   * @param {string} categoryId - The category ID to fetch related posts from
   * @param {string} currentPostId - The current post ID to exclude from results
   * @param {number} limit - Maximum number of related posts to fetch
   * @returns {Promise<Array>} List of related posts
   */
  async getRelated(categoryId, currentPostId, limit = 3) {
    if (!isSupabaseConfigured()) {
      // Get mock posts from the same category, excluding current post
      const relatedPosts = mockPosts.filter(post => 
        post.category_id === categoryId && post.id !== currentPostId
      )
      // Randomize order and take the requested limit
      return relatedPosts
        .sort(() => Math.random() - 0.5)
        .slice(0, limit)
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          categories (*)
        `)
        .eq('category_id', categoryId)
        .neq('id', currentPostId)
        .order('published_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error(`Error fetching related posts for category "${categoryId}":`, error)
      return []
    }
  }
}

/**
 * Engagement Service - Manages user interactions with posts (likes, comments, etc.)
 */
export const engagementService = {
  /**
   * Like a post (add or remove like)
   * @param {string} postId - The ID of the post to like/unlike
   * @param {boolean} isLiked - Whether the post is currently liked (to toggle)
   * @returns {Promise<number|true>} New like count (when available) or true in mock mode
   */
  async toggleLike(postId, isLiked) {
    if (!isSupabaseConfigured()) {
      // In mock mode, just simulate a successful update
      return true;
    }

    try {
      // Get or create an anonymous/guest user id for likes table
      const authData = await signInAnonymously();
      const userId = authData?.user?.id;

      if (!userId) {
        // As a fallback (should not happen when Supabase is configured), bail out early
        return true;
      }

      if (isLiked) {
        // Unlike = delete the like row for this user/post
        const { error: delError } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);
        if (delError) {
          console.warn('Supabase delete like error:', delError);
          throw delError;
        }
      } else {
        // Like = insert like row (ignore unique conflict if already liked)
        const { error: insError } = await supabase
          .from('likes')
          .insert([{ post_id: postId, user_id: userId }]);
        // If unique violation, we can ignore it safely
        if (insError && insError.code !== '23505') {
          console.warn('Supabase insert like error:', insError);
          throw insError;
        }
      }

      // Prefer authoritative count from posts.likes (trigger keeps it in sync)
      const { data: updated, error: fetchUpdatedError } = await supabase
        .from('posts')
        .select('likes')
        .eq('id', postId)
        .single();
      if (!fetchUpdatedError && updated) {
        return updated.likes ?? true;
      }

      // Fallback: count rows from likes table (works even if trigger missing)
      const { count, error: countError } = await supabase
        .from('likes')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', postId);
      if (!countError && typeof count === 'number') {
        return count;
      }
      if (fetchUpdatedError) console.warn('Supabase fetch updated post likes error:', fetchUpdatedError);
      if (countError) console.warn('Supabase count likes error:', countError);
      return true;
    } catch (error) {
      console.error(`Error toggling like for post "${postId}":`, error);
      return true; // Keep UI optimistic; optionally handle error in caller
    }
  },
  
  /**
   * Get the total number of likes for a post
   * @param {string} postId - The ID of the post
   * @returns {Promise<number>} Number of likes
   */
  async getLikes(postId) {
    if (!isSupabaseConfigured()) {
      // Return a random number for mock mode
      return Math.floor(Math.random() * 50);
    }

    try {
      // First try posts.likes (as defined in your DB and sample data)
      const { data, error } = await supabase
        .from('posts')
        .select('likes')
        .eq('id', postId)
        .single();
      if (!error && data) return data.likes || 0;

      // Fallback: count likes table rows
      const { count, error: countError } = await supabase
        .from('likes')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', postId);
      if (countError) throw countError;
      return typeof count === 'number' ? count : 0;
    } catch (error) {
      console.error(`Error getting likes for post "${postId}":`, error);
      return 0;
    }
  },

  /**
   * Check if a user has liked a post
   * @param {string} postId - The ID of the post
   * @param {string} userId - The ID of the user
   * @returns {Promise<boolean>} Whether the user has liked the post
   */
  async hasLiked(postId, userId) {
    // If not configured or missing IDs, fall back to localStorage heuristic
    if (!isSupabaseConfigured() || !postId || !userId) {
      try {
        const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
        return likedPosts.includes(postId);
      } catch {
        return false;
      }
    }

    try {
      // Query likes table for existence of a row for this (post_id, user_id)
      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return Boolean(data);
    } catch (error) {
      console.error(`Error checking if user "${userId}" liked post "${postId}":`, error);
      return false;
    }
  }
}