import React from 'react'
import { Skeleton, SkeletonText } from './Skeleton'

export const TaskCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton variant="rounded" width={80} height={24} />
        <Skeleton variant="circular" width={24} height={24} />
      </div>
      
      <Skeleton variant="text" height={20} width="75%" />
      
      <SkeletonText lines={2} />
      
      <div className="flex items-center space-x-2 pt-2">
        <Skeleton variant="circular" width={28} height={28} />
        <Skeleton variant="rounded" width={60} height={20} />
      </div>
    </div>
  )
}

interface TaskListSkeletonProps {
  count?: number
}

export const TaskListSkeleton = ({ count = 3 }: TaskListSkeletonProps) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <TaskCardSkeleton key={index} />
      ))}
    </div>
  )
}