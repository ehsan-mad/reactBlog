/**
 * Hook utilities for common UI patterns
 */

import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Hook for managing pagination
 * 
 * @param {number} initialPage - The initial page number (0-based)
 * @param {number} itemsPerPage - Number of items to display per page
 * @param {Array} items - The array of items to paginate
 * @returns {Object} Pagination state and controls
 */
export const usePagination = (initialPage = 0, itemsPerPage = 10, items = []) => {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(itemsPerPage)
  const [totalPages, setTotalPages] = useState(Math.ceil(items.length / itemsPerPage))

  // Update total pages when items or page size changes
  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil(items.length / pageSize)))
    // Reset to first page if current page is now out of bounds
    if (currentPage >= Math.ceil(items.length / pageSize)) {
      setCurrentPage(0)
    }
  }, [items, pageSize, currentPage])

  // Get current page items
  const currentItems = items.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  )

  // Page navigation functions
  const nextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1)
    }
  }, [currentPage, totalPages])

  const prevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1)
    }
  }, [currentPage])

  const goToPage = useCallback((page) => {
    const pageNumber = Math.max(0, Math.min(page, totalPages - 1))
    setCurrentPage(pageNumber)
  }, [totalPages])

  const changePageSize = useCallback((newSize) => {
    setPageSize(newSize)
    setCurrentPage(0) // Reset to first page when changing page size
  }, [])

  return {
    currentPage,
    pageSize,
    totalPages,
    currentItems,
    nextPage,
    prevPage,
    goToPage,
    changePageSize,
    hasNextPage: currentPage < totalPages - 1,
    hasPrevPage: currentPage > 0
  }
}

/**
 * Hook for setting up interval functions
 * 
 * @param {Function} callback - Function to call on each interval
 * @param {number} delay - Delay in milliseconds (null to pause)
 */
export const useInterval = (callback, delay) => {
  const savedCallback = useRef()

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval
  useEffect(() => {
    function tick() {
      savedCallback.current()
    }
    
    if (delay !== null) {
      const id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay])
}

/**
 * Hook for managing image uploads and image administration
 * 
 * @param {function} onImageAdded - Optional callback when an image is added
 * @returns {Object} Image management functions and state
 */
export const useImageAdmin = (onImageAdded) => {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  // Load initial images
  useEffect(() => {
    const loadImages = async () => {
      try {
        setLoading(true)
        // Mock image loading - replace with actual API call
        setTimeout(() => {
          const mockImages = [
            { id: 1, url: 'https://source.unsplash.com/random/800x600?blog', title: 'Blog Header' },
            { id: 2, url: 'https://picsum.photos/800/600', title: 'Generic Image' },
            { id: 3, url: 'https://source.unsplash.com/random/800x600?nature', title: 'Nature' }
          ]
          setImages(mockImages)
          setLoading(false)
        }, 800)
      } catch (err) {
        console.error('Error loading images:', err)
        setError('Failed to load images')
        setLoading(false)
      }
    }

    loadImages()
  }, [])

  // Add a new image
  const addImage = async (imageData) => {
    try {
      setUploading(true)
      setError(null)
      setSuccessMessage(null)
      
      // Mock image upload - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      const newImage = {
        id: Date.now(),
        url: imageData.url,
        title: imageData.title || 'Untitled Image'
      }
      
      setImages(prev => [newImage, ...prev])
      setSuccessMessage('Image added successfully!')
      
      if (onImageAdded) {
        onImageAdded(newImage)
      }
      
      return newImage
    } catch (err) {
      console.error('Error adding image:', err)
      setError('Failed to add image')
      return null
    } finally {
      setUploading(false)
    }
  }

  // Delete an image
  const deleteImage = async (id) => {
    try {
      setUploading(true)
      setError(null)
      setSuccessMessage(null)
      
      // Mock image deletion - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setImages(prev => prev.filter(img => img.id !== id))
      setSuccessMessage('Image deleted successfully!')
      
      return true
    } catch (err) {
      console.error('Error deleting image:', err)
      setError('Failed to delete image')
      return false
    } finally {
      setUploading(false)
    }
  }

  // Update an image's metadata
  const updateImage = async (id, updateData) => {
    try {
      setUploading(true)
      setError(null)
      setSuccessMessage(null)
      
      // Mock image update - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setImages(prev => 
        prev.map(img => img.id === id ? { ...img, ...updateData } : img)
      )
      
      setSuccessMessage('Image updated successfully!')
      return true
    } catch (err) {
      console.error('Error updating image:', err)
      setError('Failed to update image')
      return false
    } finally {
      setUploading(false)
    }
  }

  // Clear messages
  const clearMessages = () => {
    setError(null)
    setSuccessMessage(null)
  }

  return {
    images,
    loading,
    uploading,
    error,
    successMessage,
    addImage,
    deleteImage,
    updateImage,
    clearMessages
  }
}