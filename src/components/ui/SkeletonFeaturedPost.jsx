import React from 'react';

const SkeletonFeaturedPost = () => {
  return (
    <div className="featured-posts-container relative overflow-hidden animate-fadeIn">
      {/* Ensure container dimensions match exactly */}
      <div className="featured-post" style={{ height: '600px' }}>
        {/* Skeleton background with shimmer effect */}
        <div className="relative w-full h-full bg-gradient-to-b from-gray-200 to-gray-300 featured-post-image">
          {/* Shimmer animation overlay */}
          <div className="absolute inset-0 w-full h-full">
            <div className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          </div>
        </div>
        
        {/* Overlay to match the actual content */}
        <div className="featured-post-overlay">
          {/* Category badge skeleton */}
          <div className="flex">
            <div className="w-24 h-6 bg-gray-500/30 rounded-md animate-pulse mb-4"></div>
          </div>
          
          {/* Title skeleton - match the actual title's dimensions */}
          <div className="w-3/4 h-10 bg-gray-500/30 rounded animate-pulse mb-4"></div>
          
          {/* Excerpt skeleton - match the actual excerpt's dimensions */}
          <div className="space-y-2 mb-6 max-w-2xl">
            <div className="w-full h-5 bg-gray-500/30 rounded animate-pulse"></div>
            <div className="w-full h-5 bg-gray-500/30 rounded animate-pulse"></div>
            <div className="w-3/4 h-5 bg-gray-500/30 rounded animate-pulse"></div>
          </div>
          
          {/* Meta information skeleton */}
          <div className="flex space-x-6">
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-gray-500/30 mr-2"></div>
              <div className="w-24 h-5 bg-gray-500/30 rounded"></div>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-gray-500/30 mr-2"></div>
              <div className="w-16 h-5 bg-gray-500/30 rounded"></div>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-gray-500/30 mr-2"></div>
              <div className="w-16 h-5 bg-gray-500/30 rounded"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Post indicators - match exactly with actual component */}
      <div className="featured-post-indicator-container">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className={`featured-post-indicator ${i === 0 ? 'active' : ''} bg-gray-500/50`}
          />
        ))}
      </div>
    </div>
  );
};

export default SkeletonFeaturedPost;