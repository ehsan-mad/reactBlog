import React from 'react'
import Button from '../ui/Button'

/**
 * A reusable like button component
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.liked - Whether the item is liked
 * @param {number} props.count - The number of likes
 * @param {Function} props.onToggle - Function to call when the like is toggled
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.size - Button size ('sm', 'md', 'lg')
 * @returns {JSX.Element} Like button component
 */
const LikeButton = ({ 
  liked = false, 
  count = 0, 
  onToggle, 
  className = '',
  size = 'md'
}) => {
  // Determine size classes
  let iconSize = 'w-4 h-4'
  let buttonSize = 'sm'
  let spacing = 'space-x-1.5'
  
  if (size === 'sm') {
    iconSize = 'w-3.5 h-3.5'
    buttonSize = 'xs'
    spacing = 'space-x-1'
  } else if (size === 'lg') {
    iconSize = 'w-5 h-5'
    buttonSize = 'lg'
    spacing = 'space-x-2'
  }
  
  return (
    <Button
      onClick={onToggle}
      variant="ghost"
      size={buttonSize}
      className={`
        flex items-center ${spacing} transition-colors duration-200
        ${liked ? 'text-red-600 bg-red-50' : 'text-gray-600 bg-gray-50'} 
        px-3 py-1.5 rounded-full
        ${className}
      `}
      aria-label={liked ? 'Unlike' : 'Like'}
    >
      <svg 
        className={`${iconSize} ${liked ? 'fill-current' : ''}`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
        />
      </svg>
      <span className="font-medium">{count}</span>
    </Button>
  )
}

export default LikeButton