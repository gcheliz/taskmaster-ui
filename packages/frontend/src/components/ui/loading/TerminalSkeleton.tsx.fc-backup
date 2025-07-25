import React from 'react'
import { Skeleton } from './Skeleton'

export const TerminalSkeleton: React.FC = () => {
  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Skeleton variant="text" width={100} height={14} className="mb-2" />
                <Skeleton variant="text" width={60} height={28} />
              </div>
              <Skeleton variant="rounded" width={48} height={48} />
            </div>
            <div className="flex items-center">
              <Skeleton variant="text" width={80} height={14} />
            </div>
          </div>
        ))}
      </div>

      {/* Session Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-2 flex items-center gap-2 mb-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" width={140} height={40} />
        ))}
      </div>

      {/* Terminal Window */}
      <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-800">
        {/* Terminal Header */}
        <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <Skeleton variant="circular" width={12} height={12} className="bg-gray-600" />
            <Skeleton variant="circular" width={12} height={12} className="bg-gray-600" />
            <Skeleton variant="circular" width={12} height={12} className="bg-gray-600" />
          </div>
          <Skeleton variant="text" width={150} height={16} className="bg-gray-600" />
          <div className="flex items-center space-x-2">
            <Skeleton variant="rounded" width={24} height={24} className="bg-gray-600" />
            <Skeleton variant="rounded" width={24} height={24} className="bg-gray-600" />
          </div>
        </div>
        
        {/* Terminal Content */}
        <div className="p-4 font-mono text-sm space-y-2 h-96 bg-gray-900">
          {/* Command lines */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-start space-x-2">
              <Skeleton 
                variant="text" 
                width={80} 
                height={16} 
                className="bg-gray-700 flex-shrink-0" 
              />
              <Skeleton 
                variant="text" 
                width={`${40 + Math.random() * 40}%`} 
                height={16} 
                className="bg-gray-700" 
              />
            </div>
          ))}
          
          {/* Active command line */}
          <div className="flex items-center space-x-2 mt-4">
            <Skeleton variant="text" width={20} height={16} className="bg-green-700" />
            <Skeleton variant="text" width={200} height={16} className="bg-gray-700" />
            <div className="w-2 h-4 bg-gray-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Quick Commands */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mt-6">
        <Skeleton variant="text" width={120} height={16} className="mb-3" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="rounded" width={120 + i * 10} height={32} />
          ))}
        </div>
      </div>
    </>
  )
}