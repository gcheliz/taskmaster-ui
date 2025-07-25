import React from 'react'
import { Skeleton } from './Skeleton'

export const StatCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton variant="text" height={16} width="40%" />
        <Skeleton variant="circular" width={40} height={40} />
      </div>
      <Skeleton variant="text" height={32} width="60%" />
      <Skeleton variant="text" height={14} width="80%" />
    </div>
  )
}

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <Skeleton variant="text" height={24} width="40%" className="mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <Skeleton variant="text" height={16} width="60%" />
                <Skeleton variant="text" height={16} width="20%" />
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <Skeleton variant="text" height={24} width="40%" className="mb-4" />
          <Skeleton variant="rectangular" height={200} className="rounded-md" />
        </div>
      </div>
      
      {/* Quick Actions Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <Skeleton variant="text" height={28} width="30%" className="mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="text" height={16} width="70%" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}