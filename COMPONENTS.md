# Component Documentation

This document provides detailed information about the key components in the Blog App, their purpose, props, and usage examples.

## Table of Contents

1. [Common Components](#common-components)
   - [ImageWithFallback](#imagewithfallback)
   - [PostCard](#postcard)
   - [PostList](#postlist)
   - [CategoryBadge](#categorybadge)
   - [LikeButton](#likebutton)
   - [PageHeader](#pageheader)
2. [Page Components](#page-components)
   - [HomePage](#homepage)
   - [PostPage](#postpage)
   - [CategoryPage](#categorypage)
3. [Layout Components](#layout-components)
   - [Header](#header)
   - [Footer](#footer)

## Common Components

### ImageWithFallback

**Purpose**: Displays an image with fallback handling when the image fails to load or is not available.

**Props**:
- `src` (string): Image source URL
- `alt` (string): Alternative text for the image
- `className` (string): Additional CSS classes
- `fallbackSrc` (string, optional): Custom fallback image source
- `...imgProps`: Additional props to pass to the img element

**Usage Example**:
```jsx
<ImageWithFallback
  src={getCoverImageUrl(post.cover_path, post.title)}
  alt={post.title}
  className="w-full h-full object-cover"
  loading="lazy"
/>
```

### PostCard

**Purpose**: Displays a post preview in a card format with various layout options.

**Props**:
- `post` (object): Post data object
- `className` (string): Additional CSS classes
- `variant` (string): Card variant ('default', 'compact', 'featured')

**Usage Example**:
```jsx
<PostCard 
  post={post} 
  variant="featured" 
  className="border-2"
/>
```

### PostList

**Purpose**: Displays a list of posts with loading states, pagination, and error handling.

**Props**:
- `posts` (array): Array of post objects
- `loading` (boolean): Whether the initial posts are loading
- `loadingMore` (boolean): Whether additional posts are being loaded
- `error` (string): Error message, if any
- `hasMore` (boolean): Whether there are more posts to load
- `onLoadMore` (function): Function to call when loading more posts
- `onRetry` (function): Function to call when retrying after an error
- `emptyMessage` (string): Message to show when there are no posts
- `endMessage` (string): Message to show when all posts have been loaded
- `layout` (string): Layout style ('grid' or 'list')
- `columns` (number): Number of columns in the grid (1-4)
- `cardVariant` (string): Card variant to use

**Usage Example**:
```jsx
<PostList
  posts={posts}
  loading={loading}
  loadingMore={loadingMore}
  error={error}
  hasMore={hasMore}
  onLoadMore={loadMore}
  onRetry={retry}
  layout="grid"
  columns={3}
/>
```

### CategoryBadge

**Purpose**: Displays a category as a styled badge, optionally linking to the category page.

**Props**:
- `category` (object|string): Category object or category name
- `className` (string): Additional CSS classes
- `size` (string): Badge size ('sm', 'md', 'lg')
- `linkable` (boolean): Whether the badge should link to the category page

**Usage Example**:
```jsx
<CategoryBadge 
  category={post.categories} 
  size="lg"
  linkable={true}
/>
```

### LikeButton

**Purpose**: Button for liking/unliking posts with count display.

**Props**:
- `liked` (boolean): Whether the item is liked
- `count` (number): The number of likes
- `onToggle` (function): Function to call when the like is toggled
- `className` (string): Additional CSS classes
- `size` (string): Button size ('sm', 'md', 'lg')

**Usage Example**:
```jsx
<LikeButton
  liked={liked}
  count={likeCount}
  onToggle={handleLike}
  size="md"
/>
```

### PageHeader

**Purpose**: Displays a page header with title, subtitle, and optional action.

**Props**:
- `title` (string): The main header title
- `subtitle` (string): Optional subtitle text
- `action` (node): Optional action element (button, link, etc.)
- `className` (string): Additional CSS classes
- `variant` (string): Header style variant ('default', 'centered', 'gradient')

**Usage Example**:
```jsx
<PageHeader
  title="Latest Posts"
  subtitle="Stay up to date with our newest content"
  variant="gradient"
  action={<Button onClick={handleRefresh}>Refresh</Button>}
/>
```

## Page Components

### HomePage

**Purpose**: Main landing page displaying featured and latest posts.

**Features**:
- Featured posts carousel at the top
- Grid of latest posts below
- Load more pagination
- Error handling and loading states

**Data Flow**:
1. Fetches featured posts and latest posts on mount
2. Displays loading skeletons while fetching
3. Shows error message if fetch fails
4. Renders posts in grid layout
5. Provides load more functionality for pagination

### PostPage

**Purpose**: Displays a single post with its content and related posts.

**Features**:
- Full post content with Markdown rendering
- Post metadata (category, date, views, likes)
- Like functionality
- Related posts from the same category
- Error handling and loading states

**Data Flow**:
1. Fetches post data by slug on mount
2. Tracks post view once per session
3. Checks if user has liked the post
4. Fetches related posts from the same category
5. Renders post content with Markdown
6. Handles like/unlike actions with optimistic updates

### CategoryPage

**Purpose**: Displays posts filtered by a specific category.

**Features**:
- Category header with name and description
- Grid of posts in the category
- Load more pagination
- Error handling and loading states

**Data Flow**:
1. Fetches category data by slug on mount
2. Fetches posts for the category with pagination
3. Displays loading skeletons while fetching
4. Shows error message if fetch fails
5. Renders posts in grid layout
6. Provides load more functionality for pagination

## Layout Components

### Header

**Purpose**: Navigation header with dynamic category links.

**Features**:
- Logo and site title
- Dynamic category navigation
- Mobile-responsive menu
- Active route highlighting

**Data Flow**:
1. Fetches categories on mount
2. Displays loading state while fetching
3. Renders category links dynamically
4. Highlights active route based on current location
5. Handles mobile menu toggle

### Footer

**Purpose**: Page footer with site information.

**Features**:
- Site information and links
- Social media links
- Copyright notice
- Responsive layout