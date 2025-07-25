import React from 'react'
import { Skeleton } from './Skeleton'

const StatCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Skeleton variant="text" height={16} width="80%" className="mb-2" />
          <Skeleton variant="text" height={32} width="60%" />
        </div>
        <Skeleton variant="circular" width={48} height={48} />
      </div>
      <div className="flex items-center">
        <Skeleton variant="text" height={14} width="100%" />
      </div>
    </div>
  )
}

const RepositoryCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Card Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <Skeleton variant="rounded" width={40} height={40} />
          <div className="flex-1">
            <Skeleton variant="text" height={20} width="60%" className="mb-1" />
            <Skeleton variant="text" height={16} width="80%" />
          </div>
        </div>
        <Skeleton variant="rounded" width={80} height={24} />
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <Skeleton variant="text" height={32} width="60%" className="mb-1" />
            <Skeleton variant="text" height={12} width="80%" />
          </div>
        ))}
      </div>

      {/* Repository Info */}
      <div className="space-y-3 py-3 border-y border-gray-100">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton variant="text" height={14} width="40%" />
            <Skeleton variant="text" height={14} width="30%" />
          </div>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between mt-4">
        <Skeleton variant="rounded" width={100} height={36} />
        <div className="flex items-center gap-2">
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
        </div>
      </div>
    </div>
  )
}

export const RepositoriesSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Skeleton variant="rounded" height={40} width="100%" />
          </div>
          <Skeleton variant="rounded" height={40} width={140} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>

      {/* Repository List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <RepositoryCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}