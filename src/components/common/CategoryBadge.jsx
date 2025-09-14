import React from 'react'
import { Link } from 'react-router-dom'
import { getCategoryColorClasses } from '../../utils/colorUtils'

/**
 * A reusable category badge component
 * 
 * @param {Object} props - Component props
 * @param {Object|string} props.category - Category object or category name
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.size - Badge size ('sm', 'md', 'lg')
 * @param {boolean} props.linkable - Whether the badge should link to the category page
 * @returns {JSX.Element} Category badge component
 */
const CategoryBadge = ({ 
  category, 
  className = '', 
  size = 'md',
  linkable = true
}) => {
  // Handle both category object and string
  const categoryName = typeof category === 'object' ? category.name : category
  const categorySlug = typeof category === 'object' ? category.slug : null
  
  // Determine size classes
  let sizeClasses = 'text-sm px-3 py-1'
  if (size === 'sm') {
    sizeClasses = 'text-xs px-2.5 py-0.5'
  } else if (size === 'lg') {
    sizeClasses = 'text-base px-4 py-1.5'
  }
  
  // Get the color classes
  const colorClasses = getCategoryColorClasses(categoryName)
  
  // Badge content
  const badgeContent = (
    <span className={`
      inline-block font-medium rounded-full shadow-sm
      ${sizeClasses} ${colorClasses} ${className}
    `}>
      {categoryName}
    </span>
  )
  
  // If linkable and we have a slug, wrap in Link
  if (linkable && categorySlug) {
    return (
      <Link to={`/category/${categorySlug}`}>
        {badgeContent}
      </Link>
    )
  }
  
  // Otherwise, return the badge without a link
  return badgeContent
}

export default CategoryBadge