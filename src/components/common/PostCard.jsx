import React from 'react'
import { Link } from 'react-router-dom'
import { getCoverImageUrl } from '../../utils/imageUtils'
import { getCategoryColorClasses } from '../../utils/colorUtils'
import ImageWithFallback from './ImageWithFallback'

/**
 * A reusable card component for displaying post previews
 * 
 * @param {Object} props - Component props
 * @param {Object} props.post - The post data object
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.variant - Card variant (default, compact, featured)
 * @returns {JSX.Element} Post card component
 */
const PostCard = ({ post, className = '', variant = 'default' }) => {
  const {
    slug,
    title,
    excerpt,
    cover_path,
    published_at,
    views = 0,
    likes = 0,
    categories
  } = post

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Handle different card variants
  const isCompact = variant === 'compact'
  const isFeatured = variant === 'featured'
  
  const cardClasses = `
    card bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 
    ${isFeatured ? 'border-b-4 border-black' : ''} 
    ${isCompact ? 'flex items-center' : 'block'} 
    ${className}
  `

  return (
    <article className={cardClasses}>
      <Link to={`/post/${slug}`} className={isCompact ? "flex w-full" : "block"}>
        {/* Cover Image */}
        <div className={`
          ${isCompact 
            ? 'w-1/3 aspect-square' 
            : isFeatured 
              ? 'aspect-[16/9]'
              : 'aspect-video'
          } 
          bg-gray-200 overflow-hidden flex items-center justify-center relative
        `}>
          <ImageWithFallback
            src={getCoverImageUrl(cover_path, title)}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-105 filter hover:grayscale-[20%]"
            loading="lazy"
          />
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-black via-gray-500 to-black"></div>
        </div>

        {/* Content */}
        <div className={`${isCompact ? 'w-2/3 p-4' : 'p-6'}`}>
          {/* Category Badge */}
          {categories && (
            <div className="mb-3">
              <span className={`inline-block text-xs font-medium px-2.5 py-0.5 border rounded-md ${getCategoryColorClasses(categories.name)}`}>
                {categories.name}
              </span>
            </div>
          )}

          {/* Title */}
          <h2 className={`
            font-semibold text-gray-900 mb-3 hover:text-black transition-colors
            ${isFeatured ? 'text-2xl' : isCompact ? 'text-base line-clamp-1' : 'text-xl line-clamp-2'}
          `}>
            {title}
          </h2>

          {/* Excerpt - Not shown in compact view */}
          {excerpt && !isCompact && (
            <p className={`
              text-gray-600 leading-relaxed mb-4 line-clamp-3
              ${isFeatured ? 'text-base' : 'text-sm'}
            `}>
              {excerpt}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-200 pt-4 mt-2">
            {!isCompact && (
              <time dateTime={published_at} className="font-medium">
                {formatDate(published_at)}
              </time>
            )}
            
            <div className={`flex items-center space-x-4 ${isCompact ? 'w-full justify-end' : ''}`}>
              {/* Views */}
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{views}</span>
              </div>

              {/* Likes */}
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{likes}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}

export default PostCard