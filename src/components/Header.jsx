import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { categoriesService } from '../services/api.js'
import LoadingSpinner from './ui/LoadingSpinner.jsx'
import './HeaderGlassEffect.css'
import { GiBrute } from "react-icons/gi"

/**
 * Header component for the blog application.
 * Features:
 * - Responsive navigation with mobile menu
 * - Dynamic category links from API
 * - Active route highlighting
 * - Glass hover effect (styling in HeaderGlassEffect.css)
 */
const Header = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  // Fetch categories for navigation
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesService.getAll()
        setCategories(data)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location])

  // Helper to determine if a route is active
  const isActiveRoute = (path) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  // Render link with active state
  const renderNavLink = (to, label, isMobile = false) => {
    const baseClasses = isMobile 
      ? "block px-3 py-2 text-base font-medium transition-colors" 
      : "px-3 py-2 text-sm font-medium transition-colors";
    
    const activeClasses = isActiveRoute(to) 
      ? 'active text-white' 
      : 'text-gray-400 hover:text-white';
    
    return (
      <Link
        to={to}
        className={`nav-link ${baseClasses} ${activeClasses}`}
      >
        {label}
      </Link>
    );
  }

  return (
    <header className="bg-black shadow-md sticky top-0 z-50" style={{ isolation: 'isolate' }}>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-black via-gray-500 to-black"></div>
      <nav className="container-main">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-2xl font-bold text-white hover:text-gray-300 transition-colors"
            >
              <div className="w-8 h-8 bg-gray-300 rounded-md border-2 border-gray-500 shadow-md flex items-center justify-center">
                <GiBrute className="text-black" size={22} />
              </div>
              My Blog
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              {renderNavLink('/', 'Home')}

              {loading ? (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner size="sm" className="text-gray-400" />
                  <span className="text-sm text-gray-400">Loading...</span>
                </div>
              ) : (
                categories.map((category) => (
                  <React.Fragment key={category.id}>
                    {renderNavLink(`/category/${category.slug}`, category.name, false)}
                  </React.Fragment>
                ))
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-700/30 backdrop-blur-sm">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {renderNavLink('/', 'Home', true)}

              {loading ? (
                <div className="flex items-center space-x-2 px-3 py-2">
                  <LoadingSpinner size="sm" className="text-gray-400" />
                  <span className="text-sm text-gray-400">Loading categories...</span>
                </div>
              ) : (
                categories.map((category) => (
                  <React.Fragment key={category.id}>
                    {renderNavLink(`/category/${category.slug}`, category.name, true)}
                  </React.Fragment>
                ))
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header