import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { getCoverImageUrl, getImageFallback } from '../../utils/imageUtils'
import { getCategoryColorClasses } from '../../utils/colorUtils'

const PostCard = ({ post, className = '' }) => {
  const [, setImageError] = useState(false)
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

  return (
    <article className={`card bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${className}`}>
      <Link to={`/post/${slug}`} className="block">
        {/* Cover Image */}
        <div className="aspect-video bg-gray-200 overflow-hidden flex items-center justify-center relative">
          {cover_path ? (
            <img
              src={getCoverImageUrl(cover_path, title)}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-105 filter hover:grayscale-[20%]"
              loading="lazy"
              onError={(e) => {
                setImageError(true);
                // Instead of hiding, use a fallback image
                e.target.src = getImageFallback();
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 p-8">
              <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">No Image</span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-black via-gray-500 to-black"></div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Category Badge */}
          {categories && (
            <div className="mb-3">
              <span className={`inline-block text-xs font-medium px-2.5 py-0.5 border rounded-md ${getCategoryColorClasses(categories.name)}`}>
                {categories.name}
              </span>
            </div>
          )}

          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 hover:text-black transition-colors">
            {title}
          </h2>

          {/* Excerpt */}
          {excerpt && (
            <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
              {excerpt}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-200 pt-4 mt-2">
            <time dateTime={published_at} className="font-medium">
              {formatDate(published_at)}
            </time>
            
            <div className="flex items-center space-x-4">
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