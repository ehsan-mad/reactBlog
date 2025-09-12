// Storage utilities for handling views and likes
export const storageUtils = {
  // Views tracking using sessionStorage (per session)
  getViewedPosts() {
    try {
      return JSON.parse(sessionStorage.getItem('viewedPosts') || '[]')
    } catch {
      return []
    }
  },

  addViewedPost(postId) {
    try {
      const viewed = this.getViewedPosts()
      if (!viewed.includes(postId)) {
        viewed.push(postId)
        sessionStorage.setItem('viewedPosts', JSON.stringify(viewed))
        return true
      }
      return false
    } catch {
      return false
    }
  },

  hasViewedPost(postId) {
    return this.getViewedPosts().includes(postId)
  },

  // Likes tracking using localStorage (persistent)
  getLikedPosts() {
    try {
      return JSON.parse(localStorage.getItem('likedPosts') || '[]')
    } catch {
      return []
    }
  },

  addLikedPost(postId) {
    try {
      const liked = this.getLikedPosts()
      if (!liked.includes(postId)) {
        liked.push(postId)
        localStorage.setItem('likedPosts', JSON.stringify(liked))
        return true
      }
      return false
    } catch {
      return false
    }
  },

  removeLikedPost(postId) {
    try {
      const liked = this.getLikedPosts()
      const filtered = liked.filter(id => id !== postId)
      localStorage.setItem('likedPosts', JSON.stringify(filtered))
      return true
    } catch {
      return false
    }
  },

  hasLikedPost(postId) {
    return this.getLikedPosts().includes(postId)
  },

  toggleLikedPost(postId) {
    if (this.hasLikedPost(postId)) {
      this.removeLikedPost(postId)
      return false
    } else {
      this.addLikedPost(postId)
      return true
    }
  }
}

// Date formatting utilities
export const dateUtils = {
  formatDate(dateString, options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
    
    return new Date(dateString).toLocaleDateString('en-US', {
      ...defaultOptions,
      ...options
    })
  },

  formatRelativeTime(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInHours < 48) return 'Yesterday'
    if (diffInHours < 24 * 7) return `${Math.floor(diffInHours / 24)} days ago`
    
    return this.formatDate(dateString)
  }
}

// Image utilities
export const imageUtils = {
  getSupabaseImageUrl(path, bucket = 'covers') {
    if (!path) return null
    if (path.startsWith('http')) return path
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    if (!supabaseUrl) return this.getPlaceholderUrl()
    
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
  },

  getPlaceholderUrl(width = 400, height = 240) {
    return `https://via.placeholder.com/${width}x${height}/e5e7eb/6b7280?text=No+Image`
  }
}

// Text utilities
export const textUtils = {
  truncate(text, maxLength = 100) {
    if (!text || text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  },

  stripMarkdown(markdown) {
    if (!markdown) return ''
    
    return markdown
      .replace(/[#*`_~[\]]/g, '') // Remove markdown characters
      .replace(/\n\s*\n/g, ' ') // Replace double newlines with space
      .replace(/\n/g, ' ') // Replace single newlines with space
      .trim()
  },

  generateSlug(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim('-') // Remove leading/trailing hyphens
  }
}

// SEO utilities
export const seoUtils = {
  setPageTitle(title, siteName = 'My Blog') {
    document.title = title ? `${title} | ${siteName}` : siteName
  },

  setMetaDescription(description) {
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', description)
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = description
      document.head.appendChild(meta)
    }
  }
}