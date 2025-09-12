import React from 'react'

const ErrorMessage = ({ 
  message = 'Something went wrong', 
  showRetry = false, 
  onRetry,
  className = '' 
}) => {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center">
        <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex-1">
          <h3 className="text-red-800 font-medium">Error</h3>
          <p className="text-red-700 text-sm mt-1">{message}</p>
        </div>
      </div>
      
      {showRetry && onRetry && (
        <div className="mt-4">
          <button
            onClick={onRetry}
            className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors border border-gray-400"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}

export const ErrorPage = ({ title = 'Page Not Found', message = 'The page you are looking for does not exist.' }) => (
  <div className="min-h-64 flex flex-col items-center justify-center py-12">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-lg text-gray-600 mb-8">{message}</p>
      <a
        href="/"
        className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors border border-gray-400"
      >
        Go Home
      </a>
    </div>
  </div>
)

export default ErrorMessage