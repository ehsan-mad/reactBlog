import React from 'react'

/**
 * A reusable page header component with title, subtitle, and decorative elements
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - The main header title
 * @param {string} props.subtitle - Optional subtitle text
 * @param {React.ReactNode} props.action - Optional action element (button, link, etc.)
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.variant - Header style variant ('default', 'centered', 'gradient')
 * @returns {JSX.Element} Page header component
 */
const PageHeader = ({ 
  title, 
  subtitle, 
  action, 
  className = '', 
  variant = 'default' 
}) => {
  const isCentered = variant === 'centered'
  const isGradient = variant === 'gradient'
  
  return (
    <div className={`mb-8 relative ${isCentered ? 'text-center' : ''} ${className}`}>
      <div className={`${action ? 'flex items-center justify-between' : ''}`}>
        <div className={`${action ? 'flex-1' : 'w-full'}`}>
          <h2 className={`
            ${isGradient ? 'text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500' : 'text-gray-900'}
            text-3xl font-bold mb-2 relative inline-block
          `}>
            {title}
            <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-black via-gray-500 to-black"></span>
          </h2>
          
          {subtitle && (
            <p className="text-gray-600">{subtitle}</p>
          )}
        </div>
        
        {action && (
          <div className="ml-4">
            {action}
          </div>
        )}
      </div>
    </div>
  )
}

export default PageHeader