import React, { useState } from 'react';
import { useImageAdmin } from '../hooks/useUI';
import { useAdminPosts } from '../hooks/useBlog';
import Button from './ui/Button';
import { getCoverImageUrl, getImageFallback } from '../utils/imageUtils';

/**
 * Admin component for managing images and updating post cover images
 */
const ImageAdmin = () => {
  // Use our custom hooks
  const {
    images,
    loading: loadingImages,
    uploading,
    error: imageError,
    successMessage,
    addImage,
    deleteImage,
  } = useImageAdmin();
  
  const {
    posts,
    loading: loadingPosts,
    loadingAction,
    error: postError,
    actionMessage,
    updatePost,
  } = useAdminPosts();

  // Local state
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageTitle, setNewImageTitle] = useState('');
  const [showImageForm, setShowImageForm] = useState(false);
  const [selectedTab, setSelectedTab] = useState('images'); // 'images' or 'posts'
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [customImageUrl, setCustomImageUrl] = useState('');

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

  // Add a new image
  const handleAddImage = async (e) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;
    
    await addImage({
      url: newImageUrl,
      title: newImageTitle || 'Untitled'
    });
    
    // Reset form fields on success
    setNewImageUrl('');
    setNewImageTitle('');
    setShowImageForm(false);
  };

  // Apply image to post
  const handleApplyImageToPost = async (postId, imageUrl) => {
    await updatePost(postId, { cover_image: imageUrl });
  };

  // Show success and error messages
  const getStatusMessage = () => {
    if (imageError || postError) {
      return (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{imageError || postError}</p>
        </div>
      );
    }
    
    if (successMessage || actionMessage) {
      return (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
          <p>{successMessage || actionMessage}</p>
        </div>
      );
    }
    
    return null;
  };

  // Loading state
  if ((loadingImages || loadingPosts) && !images.length && !posts.length) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
        <p className="mt-4 text-gray-500 text-center">Loading image management...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {getStatusMessage()}
      
      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          className={`px-6 py-3 font-medium ${
            selectedTab === 'images' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setSelectedTab('images')}
        >
          Image Library
        </button>
        <button
          className={`px-6 py-3 font-medium ${
            selectedTab === 'posts' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setSelectedTab('posts')}
        >
          Update Post Images
        </button>
      </div>
      
      {/* Images Tab */}
      {selectedTab === 'images' && (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Image Library</h2>
            <Button 
              onClick={() => setShowImageForm(!showImageForm)}
              variant="primary"
              size="sm"
            >
              {showImageForm ? 'Cancel' : 'Add New Image'}
            </Button>
          </div>
          
          {/* Add Image Form */}
          {showImageForm && (
            <form onSubmit={handleAddImage} className="mb-8 p-4 bg-gray-50 rounded-lg">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imageUrl">
                  Image URL
                </label>
                <input
                  id="imageUrl"
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="https://example.com/image.jpg"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imageTitle">
                  Image Title
                </label>
                <input
                  id="imageTitle"
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="My Image"
                  value={newImageTitle}
                  onChange={(e) => setNewImageTitle(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={uploading || !newImageUrl.trim()}
                  isLoading={uploading}
                >
                  Add Image
                </Button>
              </div>
            </form>
          )}
          
          {/* Sample Images */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Sample Images</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sampleImages.map((url, index) => (
                <div key={index} className="border rounded overflow-hidden">
                  <div className="aspect-w-4 aspect-h-3 bg-gray-100">
                    {url.includes('{seed}') ? (
                      <div className="flex items-center justify-center h-full bg-gray-200 text-gray-500 p-2 text-center">
                        Dynamic URL with {'{seed}'}
                      </div>
                    ) : (
                      <img
                        src={url.includes('picsum:') ? url.replace('picsum:', 'https://picsum.photos/seed/sample/800/600') : url}
                        alt={`Sample ${index + 1}`}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/800x600/gray/white?text=Image+Error';
                        }}
                      />
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs truncate">{url}</p>
                    <button
                      onClick={() => setNewImageUrl(url)}
                      className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                    >
                      Use this URL
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Image Library */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Your Images</h3>
            {images.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No images in your library yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map((image) => (
                  <div key={image.id} className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                      <img
                        src={image.url}
                        alt={image.title}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/800x600/gray/white?text=Image+Error';
                        }}
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium truncate">{image.title}</h4>
                      <p className="text-sm text-gray-500 truncate">{image.url}</p>
                      <div className="mt-3 flex justify-between">
                        <button
                          onClick={() => navigator.clipboard.writeText(image.url)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Copy URL
                        </button>
                        <button
                          onClick={() => deleteImage(image.id)}
                          className="text-sm text-red-600 hover:text-red-800"
                          disabled={uploading}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Posts Tab */}
      {selectedTab === 'posts' && (
        <div className="p-6">
          <h2 className="text-xl font-bold mb-6">Update Post Images</h2>
          
          {posts.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No posts found.</p>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 aspect-w-16 aspect-h-9 bg-gray-100">
                      <img
                        src={getCoverImageUrl(post) || getImageFallback(post.title)}
                        alt={post.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="p-4 md:w-2/3">
                      <h3 className="font-bold text-lg mb-2">{post.title}</h3>
                      <p className="text-sm text-gray-500 mb-4 truncate">{post.excerpt}</p>
                      
                      {selectedPostId === post.id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            className="w-full px-3 py-2 border rounded"
                            placeholder="Enter image URL"
                            value={customImageUrl}
                            onChange={(e) => setCustomImageUrl(e.target.value)}
                          />
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleApplyImageToPost(post.id, customImageUrl)}
                              variant="primary"
                              size="sm"
                              isLoading={loadingAction}
                            >
                              Apply
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedPostId(null);
                                setCustomImageUrl('');
                              }}
                              variant="outline"
                              size="sm"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          onClick={() => {
                            setSelectedPostId(post.id);
                            setCustomImageUrl(post.cover_image || '');
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Change Image
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageAdmin;