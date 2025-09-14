# Data Flow and Supabase Integration

This document explains how data flows through the Blog App and how Supabase is integrated for data storage and management.

## Table of Contents

1. [Data Flow Overview](#data-flow-overview)
2. [Supabase Database Schema](#supabase-database-schema)
3. [API Services](#api-services)
4. [Data Fetching Patterns](#data-fetching-patterns)
5. [Caching System](#caching-system)
6. [Data Updates and Mutations](#data-updates-and-mutations)
7. [Fallback Mechanism](#fallback-mechanism)
8. [User Engagement Tracking](#user-engagement-tracking)

## Data Flow Overview

The Blog App follows a clear data flow pattern:

1. **Database Layer**: Supabase PostgreSQL database stores all blog data
2. **API Layer**: Services fetch data from Supabase and handle errors
3. **State Layer**: React hooks manage component state and data loading
4. **UI Layer**: Components render data and handle user interactions

This layered approach ensures separation of concerns and maintainable code.

## Supabase Database Schema

The database schema is defined in `database-setup.sql` and includes the following tables:

### Categories Table

Stores blog categories with the following structure:
```sql
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### Posts Table

Stores blog posts with the following structure:
```sql
CREATE TABLE posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_path TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  published BOOLEAN DEFAULT false NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  views INTEGER DEFAULT 0 NOT NULL,
  likes INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### Likes Table

Tracks user likes with the following structure:
```sql
CREATE TABLE likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(post_id, user_id)
);
```

### Post Views Table

Tracks unique post views with the following structure:
```sql
CREATE TABLE post_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(post_id, user_id)
);
```

## API Services

The API services are structured to provide a clean interface for data access:

### Categories Service

Located in `services/api.js` and enhanced in `services/enhancedApi.js`, it provides methods for:

- `getAll()`: Fetches all categories for navigation
- `getBySlug(slug)`: Fetches a single category by its slug

### Posts Service

Located in `services/api.js` and enhanced in `services/enhancedApi.js`, it provides methods for:

- `getPublished(limit, offset)`: Fetches published posts with pagination
- `getBySlug(slug)`: Fetches a single post by its slug
- `getByCategory(categorySlug, limit, offset)`: Fetches posts by category with pagination
- `incrementViews(postId)`: Increments the view count for a post
- `getRelated(categoryId, currentPostId, limit)`: Fetches related posts from the same category

### Engagement Service

Located in `services/api.js` and enhanced in `services/enhancedApi.js`, it provides methods for:

- `toggleLike(postId, isLiked)`: Toggles a like for a post
- `getLikes(postId)`: Gets the number of likes for a post
- `hasLiked(postId, userId)`: Checks if a user has liked a post

## Data Fetching Patterns

The application uses several patterns for efficient data fetching:

### Direct API Calls

Basic pattern used in simple components:

```jsx
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await apiService.getData();
      setData(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, []);
```

### Custom Hooks

More advanced components use custom hooks for data fetching:

```jsx
// In a component
const { posts, loading, error, loadMore, hasMore } = usePosts(10);

// In useBlog.js
export const usePosts = (initialLimit = 6) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  // ...implementation
  
  return { posts, loading, error, loadMore, hasMore };
};
```

### Enhanced Hooks with Fetch Utilities

The most optimized components use enhanced hooks with caching:

```jsx
// In a component
const { data: posts, loading, error } = useFetch(
  () => postsService.getPublished(10, 0),
  []
);
```

## Caching System

The enhanced API service includes a caching system to minimize duplicate requests:

### Cache Utility

Located in `utils/dataService.js`, it provides:

- In-memory cache for API responses
- Time-based cache invalidation
- Key-based cache lookup
- Prefix-based cache invalidation

### Cacheable Fetch Function

Creates a cached version of any fetch function:

```javascript
const cachedFetchPosts = createCacheableFetch(
  async (limit, offset) => {
    // Actual fetch implementation
    const { data } = await supabase.from('posts')...
    return data;
  },
  'posts:published', // Cache key
  60000, // Cache time (1 minute)
  (limit, offset) => mockPosts.slice(offset, offset + limit) // Fallback
);
```

### Cache Invalidation

Automatically invalidates cache when data changes:

```javascript
async function toggleLike(postId) {
  // Update data
  await supabase.from('likes')...
  
  // Invalidate relevant caches
  invalidateCache(`posts:bySlug:["${postId}"]`);
  invalidateCache('posts:published', true);
}
```

## Data Updates and Mutations

The application handles data updates and mutations through the API services:

### Like/Unlike Posts

```javascript
// In a component
const handleLike = async () => {
  // Optimistic UI update
  setLiked(!liked);
  setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  
  // Backend update
  try {
    const newCount = await engagementService.toggleLike(post.id, liked);
    // Update with server value if available
    if (typeof newCount === 'number') {
      setLikeCount(newCount);
    }
  } catch (error) {
    // Revert optimistic update on error
    setLiked(liked);
    setLikeCount(likeCount);
  }
};
```

### Increment Views

```javascript
// Track view once per session
const viewedPosts = JSON.parse(sessionStorage.getItem('viewedPosts') || '[]');
if (!viewedPosts.includes(post.id)) {
  const newCount = await postsService.incrementViews(post.id);
  setViewCount(prev => (typeof newCount === 'number' ? newCount : prev + 1));
  // Mark as viewed in session
  viewedPosts.push(post.id);
  sessionStorage.setItem('viewedPosts', JSON.stringify(viewedPosts));
}
```

## Fallback Mechanism

The application includes a fallback mechanism for when Supabase is not configured:

### Supabase Client Fallback

```javascript
let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    // Configuration
  });
} else {
  console.warn('Supabase environment variables not configured. Using mock data for development.');
  // Create a mock client that returns mock data
  supabase = { /* mock implementation */ };
}
```

### API Service Fallback

```javascript
async function getPublished(limit = 10, offset = 0) {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, using mock data');
    return mockPosts.slice(offset, offset + limit);
  }
  
  try {
    // Real implementation with Supabase
    const { data, error } = await supabase.from('posts')...
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching published posts:', error);
    return mockPosts.slice(offset, offset + limit);
  }
}
```

## User Engagement Tracking

The application tracks user engagement in several ways:

### Anonymous Authentication

For tracking likes without requiring signup:

```javascript
export const signInAnonymously = async () => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, skipping anonymous auth');
    return null;
  }

  try {
    // Since anonymous sign-ins are disabled, we'll use a guest ID from localStorage instead
    let guestId = localStorage.getItem('blog_guest_id');
    
    if (!guestId) {
      // Create a random ID for the guest if none exists
      guestId = crypto.randomUUID();
      localStorage.setItem('blog_guest_id', guestId);
    }
    
    return { user: { id: guestId } };
  } catch (error) {
    console.error('Error with guest authentication:', error);
    return null;
  }
};
```

### View Tracking

Using session storage to prevent duplicate counts:

```javascript
// In sessionStorage
const viewedPosts = JSON.parse(sessionStorage.getItem('viewedPosts') || '[]');
if (!viewedPosts.includes(postId)) {
  // Track view in database
  await postsService.incrementViews(postId);
  // Update local storage
  viewedPosts.push(postId);
  sessionStorage.setItem('viewedPosts', JSON.stringify(viewedPosts));
}
```

### Like Tracking

Using both database and localStorage for a consistent experience:

```javascript
// Check if user has liked post
const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
const isLiked = likedPosts.includes(postId);

// Toggle like
if (isLiked) {
  // Remove from localStorage
  const updatedLikes = likedPosts.filter(id => id !== postId);
  localStorage.setItem('likedPosts', JSON.stringify(updatedLikes));
  
  // Remove from database
  await supabase.from('likes').delete()...
} else {
  // Add to localStorage
  likedPosts.push(postId);
  localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
  
  // Add to database
  await supabase.from('likes').upsert()...
}
```