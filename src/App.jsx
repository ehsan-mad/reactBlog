import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import HomePage from './pages/HomePage.jsx'
import PostPage from './pages/PostPage.jsx'
import CategoryPage from './pages/CategoryPage.jsx'
import { ErrorPage } from './components/ui/ErrorMessage.jsx'

/**
 * Main App component - Defines the application structure and routing
 * 
 * Features:
 * - Responsive layout with header, main content area, and footer
 * - React Router setup for navigation between pages
 * - 404 error page handling
 */
function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* Vercel Web Analytics */}
        <Analytics />
        <Header />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/post/:slug" element={<PostPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="*" element={
              <ErrorPage 
                title="Page Not Found" 
                message="The page you are looking for does not exist." 
              />
            } />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  )
}

export default App
