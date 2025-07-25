import React from 'react'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-3 mt-auto hidden sm:block">
      <div className="flex items-center justify-between text-sm">
        <div className="text-gray-500">© 2025 TaskMaster UI. All rights reserved.</div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-500">Status: Online</span>
          </div>
          <span className="text-gray-500">v1.0.0</span>
        </div>
      </div>
    </footer>
  )
}
