import React, { useState } from 'react';
import { getImageFallback } from '../../utils/imageUtils';

/**
 * An enhanced image component with WebP support and fallback handling
 * 
 * @param {Object} props - Component props
 * @param {string} props.src - Primary image source URL
 * @param {string} props.webpSrc - WebP version of the image (optional)
 * @param {string} props.alt - Image alt text
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.fallbackSrc - Custom fallback image source (optional)
 * @param {string} props.width - Image width (optional)
 * @param {string} props.height - Image height (optional)
 * @param {Object} props.imgProps - Additional props to pass to the img element
 * @returns {JSX.Element} Optimized image component with WebP support and fallback
 */
const OptimizedImage = ({
  src,
  webpSrc,
  alt,
  className = '',
  fallbackSrc = null,
  width,
  height,
  placeholder = 'blur',
  ...imgProps
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Generate a WebP source if not provided but src exists
  const derivedWebpSrc = webpSrc || (src && src.match(/\.(jpe?g|png)$/i) 
    ? src.replace(/\.(jpe?g|png)$/i, '.webp') 
    : null);

  // Get fallback image if needed
  const fallback = fallbackSrc || getImageFallback(alt);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  // If no src provided, show fallback immediately
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="flex flex-col items-center justify-center text-gray-400 p-8">
          <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm">No Image</span>
        </div>
      </div>
    );
  }

  // With WebP support using <picture> element
  return (
    <div className={`relative ${className}`}>
      {/* Placeholder/blur-up effect while loading */}
      {placeholder === 'blur' && !isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse" 
          style={{ 
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}
        />
      )}

      <picture>
        {/* WebP source if available */}
        {derivedWebpSrc && !hasError && (
          <source srcSet={derivedWebpSrc} type="image/webp" />
        )}
        
        {/* Original image source */}
        <img
          src={hasError ? fallback : src}
          alt={alt}
          className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          loading="lazy"
          width={width}
          height={height}
          onError={handleError}
          onLoad={handleLoad}
          {...imgProps}
        />
      </picture>

      {/* Accessibility description for complex images */}
      {alt && alt.length > 125 && (
        <div className="sr-only">{alt}</div>
      )}
    </div>
  );
};

export default OptimizedImage;