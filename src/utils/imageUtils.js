/**
 * Utility functions for handling images in the blog app
 */

// List of placeholder image services
const PLACEHOLDER_SERVICES = [
  'https://picsum.photos/seed/{seed}/800/600',
  'https://placehold.co/800x600/random/webp?text={seed}',
  'https://source.unsplash.com/random/800x600/?{seed}'
];

/**
 * Get a valid URL for a cover image
 * @param {Object|string} input - The post object or image path
 * @param {string} fallbackTitle - Optional fallback title for placeholder generation
 * @returns {string|null} - The resolved image URL or null if no valid URL could be generated
 */
export const getCoverImageUrl = (input, fallbackTitle = '') => {
  // Handle case where input is a post object
  if (input && typeof input === 'object') {
    const post = input;
    // Check for multiple possible field names
    const path = post.cover_image || post.cover_path || post.coverImage || post.image;
    const title = post.title || fallbackTitle;
    
    // If no cover image provided, return a placeholder based on the title
    if (!path) {
      return getImageFallback(title);
    }
    
    return getCoverImageUrl(path, title);
  }
  
  // Now we know input is a string path
  const path = input;
  
  // Case 1: No path provided
  if (!path) {
    return getImageFallback(fallbackTitle);
  }
  
  // Case 2: Full URL already provided
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Case 3: Supabase storage path
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (supabaseUrl && !path.includes('{') && !path.includes('}')) {
    return `${supabaseUrl}/storage/v1/object/public/covers/${path}`;
  }
  
  // Case 4: Placeholder template (e.g. "picsum:{seed}")
  if (path.includes('{seed}')) {
    // Generate a seed from the post title or use a random one
    const seed = fallbackTitle 
      ? encodeURIComponent(fallbackTitle.toLowerCase().replace(/\s+/g, '-').substring(0, 20))
      : Math.floor(Math.random() * 1000);
    
    return path.replace('{seed}', seed);
  }
  
  // Case 5: Placeholder service name (e.g. "picsum", "unsplash")
  if (path === 'picsum') {
    return PLACEHOLDER_SERVICES[0].replace('{seed}', Math.floor(Math.random() * 1000));
  }
  
  if (path === 'placeholder') {
    return PLACEHOLDER_SERVICES[1].replace('{seed}', 'Blog+Post');
  }
  
  if (path === 'unsplash') {
    return PLACEHOLDER_SERVICES[2].replace('{seed}', 'blog');
  }
  
  // If the path looks like it might be a relative URL, assume it's an absolute path
  if (!path.match(/^[a-zA-Z]+:/) && !path.startsWith('/')) {
    return path;
  }
  
  // Fallback to a random placeholder
  return PLACEHOLDER_SERVICES[0].replace('{seed}', Math.floor(Math.random() * 1000));
};

/**
 * Get the appropriate fallback when an image fails to load
 * @param {string} title - Optional title to use for the fallback placeholder
 * @returns {string} - URL to a generic fallback image
 */
export const getImageFallback = (title = '') => {
  if (title) {
    return PLACEHOLDER_SERVICES[1].replace('{seed}', encodeURIComponent(title.replace(/\s+/g, '+')));
  }
  return 'https://placehold.co/800x600/lightgray/gray?text=Image+Not+Available';
};