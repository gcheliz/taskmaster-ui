import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/atoms/Card'
import { cn } from '../../utils/cn'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: 'primary' | 'success' | 'warning' | 'error' | 'purple' | 'pink'
  onClick: () => void
}

interface QuickActionsProps {
  actions: QuickAction[]
  className?: string
}

const colorClasses = {
  primary: 'bg-primary-100 text-primary-600 hover:bg-primary-200',
  success: 'bg-green-100 text-semantic-success hover:bg-green-200',
  warning: 'bg-yellow-100 text-semantic-warning hover:bg-yellow-200',
  error: 'bg-red-100 text-semantic-error hover:bg-red-200',
  purple: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
  pink: 'bg-pink-100 text-pink-600 hover:bg-pink-200',
}

export const QuickActions = ({ actions, className }: QuickActionsProps) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action, index) => (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.onClick}
              className={cn(
                'p-4 rounded-lg text-left transition-all duration-200',
                'border border-transparent hover:border-secondary-200',
                'hover:shadow-md',
                colorClasses[action.color]
              )}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-md bg-white/50">{action.icon}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{action.title}</h4>
                  <p className="text-xs mt-1 opacity-75">{action.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
