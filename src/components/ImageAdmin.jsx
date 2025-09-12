import React, { useState, useEffect } from 'react';
import { postsService } from '../services/api';
import { checkSupabaseConnection } from '../services/supabase';
import Button from './ui/Button';

/**
 * Admin component for updating post cover images
 */
const ImageAdmin = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageUrls, setImageUrls] = useState({});
  const [updateStatus, setUpdateStatus] = useState({});
  const [connectionError, setConnectionError] = useState(null);

  // Sample image URLs to choose from
  const sampleImages = [
    'https://picsum.photos/seed/tech/800/600',
    'https://picsum.photos/seed/travel/800/600',
    'https://picsum.photos/seed/food/800/600',
    'https://picsum.photos/seed/programming/800/600',
    'https://picsum.photos/seed/design/800/600',
    'https://source.unsplash.com/random/800x600/?technology',
    'https://source.unsplash.com/random/800x600/?travel',
    'https://source.unsplash.com/random/800x600/?food',
    'https://source.unsplash.com/random/800x600/?programming',
    'https://source.unsplash.com/random/800x600/?design',
    'https://placehold.co/800x600/random/webp?text=Technology',
    'https://placehold.co/800x600/random/webp?text=Travel',
    'https://placehold.co/800x600/random/webp?text=Food',
    'https://placehold.co/800x600/random/webp?text=Programming',
    'https://placehold.co/800x600/random/webp?text=Design',
    'picsum:{seed}',
    'unsplash',
    'placeholder'
  ];

  useEffect(() => {
    const initializeAdmin = async () => {
      setLoading(true);
      
      // First check the Supabase connection
      const connectionStatus = await checkSupabaseConnection();
      
      if (!connectionStatus.connected) {
        setConnectionError(connectionStatus.error || 'Could not connect to Supabase');
        setLoading(false);
        return;
      }
      
      try {
        console.log('Fetching posts for image management...');
        const allPosts = await postsService.getAll();
        
        if (!allPosts || allPosts.length === 0) {
          console.warn('No posts found');
          setPosts([]);
          setLoading(false);
          return;
        }
        
        console.log(`Found ${allPosts.length} posts`);
        setPosts(allPosts);
        
        // Initialize image URLs with current values
        const urls = {};
        allPosts.forEach(post => {
          urls[post.id] = post.cover_path || '';
        });
        setImageUrls(urls);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setConnectionError(error.message || 'Error fetching posts');
      } finally {
        setLoading(false);
      }
    };
    
    initializeAdmin();
  }, []);

  const handleImageUrlChange = (postId, url) => {
    setImageUrls(prev => ({
      ...prev,
      [postId]: url
    }));
  };

  const updatePostImage = async (postId) => {
    setUpdateStatus(prev => ({ ...prev, [postId]: 'updating' }));
    try {
      console.log(`Attempting to update post ${postId} with image URL:`, imageUrls[postId]);
      
      // Update the post in the database
      const updatedPost = await postsService.update(postId, { cover_path: imageUrls[postId] });
      
      if (!updatedPost) {
        // Post not found
        setUpdateStatus(prev => ({ ...prev, [postId]: 'error' }));
        console.error(`Post with ID ${postId} not found or couldn't be updated`);
        
        // Ask user if they want to create the post
        if (confirm(`Post with ID ${postId} not found. Would you like to create it in the database?`)) {
          await createMissingPost(postId);
        }
        return;
      }
      
      // Update local state to reflect the change
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, cover_path: imageUrls[postId] }
          : post
      ));
      
      console.log('Update successful:', updatedPost);
      setUpdateStatus(prev => ({ ...prev, [postId]: 'success' }));
      
      // Clear status after 3 seconds
      setTimeout(() => {
        setUpdateStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[postId];
          return newStatus;
        });
      }, 3000);
    } catch (error) {
      console.error('Error updating post image:', error);
      setUpdateStatus(prev => ({ ...prev, [postId]: 'error' }));
      
      // Show a more detailed error message
      let errorMessage = 'Failed to update image URL.';
      
      if (error?.code === 'NOT_FOUND') {
        errorMessage = `Post with ID ${postId} not found. Would you like to create it?`;
        
        if (confirm(errorMessage)) {
          await createMissingPost(postId);
        }
      } else if (error?.code === 'PGRST116') {
        errorMessage = 'The post does not exist in the database. Would you like to create it?';
        
        if (confirm(errorMessage)) {
          await createMissingPost(postId);
        }
      } else if (error?.message) {
        alert(`Error: ${error.message}`);
      } else {
        alert(errorMessage);
      }
    }
  };
  
  // Function to create a missing post
  const createMissingPost = async (postId) => {
    try {
      setUpdateStatus(prev => ({ ...prev, [postId]: 'updating' }));
      
      // Get the post from our local state
      const localPost = posts.find(p => p.id === postId);
      
      if (!localPost) {
        alert('Cannot find post information in local state.');
        setUpdateStatus(prev => ({ ...prev, [postId]: 'error' }));
        return;
      }
      
      // Create the post with the same ID
      const newPost = await postsService.createIfNotExists({
        ...localPost,
        cover_path: imageUrls[postId]
      });
      
      if (newPost) {
        // Update local state
        setPosts(prev => {
          const updatedPosts = [...prev];
          const index = updatedPosts.findIndex(p => p.id === postId);
          
          if (index !== -1) {
            updatedPosts[index] = newPost;
          } else {
            updatedPosts.push(newPost);
          }
          
          return updatedPosts;
        });
        
        setUpdateStatus(prev => ({ ...prev, [postId]: 'success' }));
        alert('Post created successfully!');
        
        // Clear status after 3 seconds
        setTimeout(() => {
          setUpdateStatus(prev => {
            const newStatus = { ...prev };
            delete newStatus[postId];
            return newStatus;
          });
        }, 3000);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setUpdateStatus(prev => ({ ...prev, [postId]: 'error' }));
      alert(`Failed to create post: ${error.message || 'Unknown error'}`);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading posts...</div>;
  }
  
  if (connectionError) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-300 text-red-800 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-2">Database Connection Error</h3>
          <p>{connectionError}</p>
          <p className="mt-2">Please check your Supabase configuration and make sure the database is running.</p>
        </div>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-8">
      <h2 className="text-2xl font-bold mb-6">Image URL Management</h2>
      
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Important Database Information</h3>
        <p className="text-yellow-700 mb-2">
          If you encounter "Post not found" errors, it means the posts from the mock data don't exist in your Supabase database yet.
        </p>
        <p className="text-yellow-700">
          You can either:
        </p>
        <ul className="list-disc pl-6 text-yellow-700 mt-1 mb-2">
          <li>Click "Create post in database" when prompted to create missing posts</li>
          <li>Run the SQL setup script in your Supabase SQL editor to create all tables and sample data</li>
        </ul>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Sample Image URLs</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {sampleImages.slice(0, 5).map((url, index) => (
            <div key={index} className="relative group">
              <img 
                src={url} 
                alt={`Sample ${index + 1}`} 
                className="w-20 h-20 object-cover rounded cursor-pointer border-2 hover:border-blue-500"
                onClick={() => navigator.clipboard.writeText(url)}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                <span className="text-white text-xs">Click to copy</span>
              </div>
            </div>
          ))}
        </div>
        <div className="text-sm text-gray-600 mb-2">
          <p>You can also use these placeholder formats:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li><code className="bg-gray-100 px-1 rounded">picsum:{'{seed}'}</code> - Random image from Lorem Picsum with your seed</li>
            <li><code className="bg-gray-100 px-1 rounded">unsplash</code> - Random image from Unsplash</li>
            <li><code className="bg-gray-100 px-1 rounded">placeholder</code> - Text placeholder image</li>
          </ul>
        </div>
      </div>
      
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Update Post Images</h3>
        {posts.map(post => (
          <div key={post.id} className="border rounded-lg p-4 flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/3">
              <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                {imageUrls[post.id] ? (
                  <img 
                    src={imageUrls[post.id].startsWith('http') ? imageUrls[post.id] : `https://picsum.photos/seed/${post.slug}/800/600`}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/800x600/lightgray/gray?text=Preview';
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    No image URL set
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1">
              <h4 className="font-bold text-lg mb-2">{post.title}</h4>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL:
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={imageUrls[post.id] || ''}
                    onChange={(e) => handleImageUrlChange(post.id, e.target.value)}
                    className="flex-1 border rounded-l px-3 py-2 text-sm"
                    placeholder="Enter image URL or use a placeholder format"
                  />
                  <Button 
                    onClick={() => updatePostImage(post.id)} 
                    className="rounded-l-none"
                    disabled={updateStatus[post.id] === 'updating'}
                  >
                    {updateStatus[post.id] === 'updating' ? 'Updating...' : 'Update'}
                  </Button>
                </div>
                {updateStatus[post.id] === 'success' && (
                  <p className="text-green-600 text-sm mt-1">Image URL updated successfully!</p>
                )}
                {updateStatus[post.id] === 'error' && (
                  <div className="mt-1">
                    <p className="text-red-600 text-sm">
                      Error updating image URL. The post may not exist in the database.
                    </p>
                    <button
                      onClick={() => createMissingPost(post.id)}
                      className="text-sm text-blue-600 hover:text-blue-800 mt-1 underline"
                    >
                      Create post in database
                    </button>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quick Select:
                </label>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => handleImageUrlChange(post.id, `https://picsum.photos/seed/${post.slug}/800/600`)}
                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-xs rounded"
                  >
                    Picsum
                  </button>
                  <button 
                    onClick={() => handleImageUrlChange(post.id, `https://source.unsplash.com/random/800x600/?${post.categories?.slug || 'blog'}`)}
                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-xs rounded"
                  >
                    Unsplash
                  </button>
                  <button 
                    onClick={() => handleImageUrlChange(post.id, `https://placehold.co/800x600/random/webp?text=${post.categories?.name || 'Blog'}`)}
                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-xs rounded"
                  >
                    Placeholder
                  </button>
                  <button 
                    onClick={() => handleImageUrlChange(post.id, '')}
                    className="px-2 py-1 bg-red-100 hover:bg-red-200 text-xs rounded"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageAdmin;