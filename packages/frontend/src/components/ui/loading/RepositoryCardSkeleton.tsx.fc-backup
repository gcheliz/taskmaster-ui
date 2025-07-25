import React from 'react'
import { Skeleton, SkeletonText } from './Skeleton'

export const RepositoryCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" height={24} width="60%" />
          <SkeletonText lines={2} />
        </div>
        <Skeleton variant="circular" width={40} height={40} />
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <Skeleton variant="circular" width={16} height={16} />
          <Skeleton variant="text" width={40} height={16} />
        </div>
        <div className="flex items-center space-x-1">
          <Skeleton variant="circular" width={16} height={16} />
          <Skeleton variant="text" width={40} height={16} />
        </div>
        <div className="flex items-center space-x-1">
          <Skeleton variant="circular" width={16} height={16} />
          <Skeleton variant="text" width={40} height={16} />
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-2">
        <Skeleton variant="rounded" width={100} height={32} />
        <Skeleton variant="text" width={120} height={16} />
      </div>
    </div>
  )
}

interface RepositoryListSkeletonProps {
  count?: number
}

export const RepositoryListSkeleton: React.FC<RepositoryListSkeletonProps> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <RepositoryCardSkeleton key={index} />
      ))}
    </div>
  )
}