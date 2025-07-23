import React from 'react'
import { cn } from '../../utils/cn'

export interface ContainerProps {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  as?: React.ElementType
}

const containerSizes = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
  xl: 'max-w-[90rem]',
  full: 'max-w-full',
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className,
  size = 'lg',
  as: Component = 'div',
}) => {
  return (
    <Component
      className={cn(
        'mx-auto px-4 sm:px-6 lg:px-8',
        containerSizes[size],
        className
      )}
    >
      {children}
    </Component>
  )
}