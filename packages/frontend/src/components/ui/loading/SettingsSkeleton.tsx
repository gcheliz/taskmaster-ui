import React from 'react'
import { Skeleton } from './Skeleton'

export const SettingsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Settings Cards */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
          {/* Card Header */}
          <div className="flex items-center space-x-3 mb-6">
            <Skeleton variant="rounded" width={40} height={40} />
            <Skeleton variant="text" width={150} height={24} />
          </div>
          
          {/* Settings Options */}
          <div className="space-y-6">
            {[1, 2, 3].map((j) => (
              <div key={j} className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton variant="text" width="60%" height={16} />
                  <Skeleton variant="rounded" width={50} height={24} />
                </div>
                {j === 1 && (
                  <Skeleton variant="text" width="80%" height={14} className="opacity-60" />
                )}
              </div>
            ))}
          </div>
          
          {/* Action Button */}
          {i === 1 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <Skeleton variant="rounded" width="100%" height={40} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}