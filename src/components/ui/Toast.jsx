import React, { useEffect } from 'react'

export const Toast = ({ message, onClose, duration = 2500 }) => {
  useEffect(() => {
    const id = setTimeout(onClose, duration)
    return () => clearTimeout(id)
  }, [onClose, duration])

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]">
      <div className="bg-black/80 text-white px-4 py-2 rounded shadow-md text-sm">
        {message}
      </div>
    </div>
  )
}

export default Toast
