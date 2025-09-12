import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFeaturedPosts } from '../hooks/useBlog';
import { getCoverImageUrl, getImageFallback } from '../utils/imageUtils';
import { getCategoryColorClasses } from '../utils/colorUtils';
import SkeletonFeaturedPost from './ui/SkeletonFeaturedPost';
import './FeaturedPostsHighlight.css';
import { useAutoRotate } from '../hooks/useAutoRotate';
import CarouselArrow from './ui/CarouselArrow';
import CarouselDots from './ui/CarouselDots';

/**
 * FeaturedPostsHighlight component displays a rotating slider of featured blog posts
 * with animated transitions, loading states, and interactive indicators.
 */
const FeaturedPostsHighlight = () => {
  const { featuredPosts, loading, error } = useFeaturedPosts(5);
  const [activeIndex, setActiveIndex] = useState(0);
  const [initialized, setInitialized] = useState(false);

  // Auto-rotate featured posts
  useAutoRotate({
    enabled: true,
    delay: 6000,
    length: featuredPosts.length,
    onTick: () => {
      if (featuredPosts.length > 1) {
        setActiveIndex((current) => (current + 1) % featuredPosts.length);
      }
    },
  });

  // Set initialized after a small delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialized(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Handle manual navigation
  const goToSlide = (index) => {
    setActiveIndex(index);
  };

  const nextSlide = () => {
    if (featuredPosts.length > 1) {
      setActiveIndex((current) => (current + 1) % featuredPosts.length);
    }
  };

  const prevSlide = () => {
    if (featuredPosts.length > 1) {
      setActiveIndex((current) => (current - 1 + featuredPosts.length) % featuredPosts.length);
    }
  };

  // Show skeleton while loading
  if (loading || featuredPosts.length === 0) {
    return <SkeletonFeaturedPost />;
  }

  // If there's an error or no posts, don't render anything
  if (error || featuredPosts.length === 0) {
    console.error("FeaturedPostsHighlight error:", error);
    return null;
  }
  
  // Debug logs removed to avoid noisy console output during re-renders/auto-rotation

  return (
    <div className="featured-posts-highlight relative overflow-hidden rounded-xl">
      {/* Featured posts slider */}
      <div className="relative h-[500px] md:h-[600px]">
        {featuredPosts.map((post, index) => {
          const isActive = index === activeIndex;
          const categoryClasses = post.categories ? getCategoryColorClasses(post.categories.name) : null;

          return (
            <div
              key={post.id}
              className={`featured-post-slide absolute w-full h-full transition-opacity duration-1000 ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
              } ${initialized ? '' : 'no-transition'}`}
            >
              {/* Background image with gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-90 z-10"></div>
              <img
                src={post.cover_path || getCoverImageUrl(post) || getImageFallback(post.title)}
                alt={post.title}
                className="absolute inset-0 w-full h-full object-cover object-center"
                onError={(e) => {
                  console.log("Image load error for:", post.title);
                  e.target.onerror = null; // Prevent infinite error loop
                  e.target.src = getImageFallback(post.title);
                }}
              />

              {/* Post content */}
              <div className="absolute bottom-0 left-0 right-0 z-20 p-6 md:p-10">
                <div className="max-w-4xl mx-auto">
                  {post.categories && (
                    <Link
                      to={`/category/${post.categories.slug}`}
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${categoryClasses}`}
                    >
                      {post.categories.name}
                    </Link>
                  )}

                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
                    <Link to={`/post/${post.slug}`} className="hover:underline">
                      {post.title}
                    </Link>
                  </h2>

                  <p className="text-gray-200 text-lg md:text-xl mb-6 line-clamp-2">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center text-gray-300 text-sm">
                    <span>{new Date(post.published_at).toLocaleDateString()}</span>
                    <span className="mx-2">•</span>
                    <span>{post.views} views</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slider controls */}
      {featuredPosts.length > 1 && (
        <>
          {/* Navigation arrows */}
          <CarouselArrow side="left" onClick={prevSlide} ariaLabel="Previous slide" />
          <CarouselArrow side="right" onClick={nextSlide} ariaLabel="Next slide" />

          {/* Dots indicator */}
          <CarouselDots count={featuredPosts.length} activeIndex={activeIndex} onSelect={goToSlide} />
        </>
      )}
    </div>
  );
};

export default FeaturedPostsHighlight;