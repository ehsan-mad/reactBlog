import React from 'react';
import ImageAdmin from '../components/ImageAdmin_clean';

/**
 * AdminPage component - Provides administrative tools for the blog
 */
const AdminPage = () => {
  return (
    <div className="container-main py-8">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <p className="text-gray-600 mb-8">
        Use this page to manage your blog images and post content.
      </p>
      
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">Using Images in Posts</h2>
        <p className="text-blue-700 mb-2">
          You can use different types of image URLs in your posts:
        </p>
        <ul className="list-disc pl-6 text-blue-700 space-y-1">
          <li>Direct image URLs (https://example.com/image.jpg)</li>
          <li>Placeholder services like Picsum, Unsplash, or generic placeholders</li>
          <li>Dynamic placeholders with {'{seed}'} that will use the post title as a seed</li>
        </ul>
      </div>
      
      <ImageAdmin />
    </div>
  );
};

export default AdminPage;