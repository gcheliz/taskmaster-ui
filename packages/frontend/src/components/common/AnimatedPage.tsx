import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { motionPresets, getReducedMotionVariants } from '../../utils/animations'

interface AnimatedPageProps {
  children: React.ReactNode
  preset?: keyof typeof motionPresets
  className?: string
}

export const AnimatedPage = ({ 
  children, 
  preset = 'fade',
  className = ''
}: AnimatedPageProps) => {
  const motionProps = motionPresets[preset]
  const variants = getReducedMotionVariants(motionProps.variants)

  return (
    <motion.div
      initial={motionProps.initial}
      animate={motionProps.animate}
      exit={motionProps.exit}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface AnimatedListProps {
  children: React.ReactNode
  className?: string
}

export const AnimatedList = ({ 
  children, 
  className = ''
}: AnimatedListProps) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={{
        animate: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface AnimatedListItemProps {
  children: React.ReactNode
  className?: string
  index?: number
}

export const AnimatedListItem = ({ 
  children, 
  className = '',
  index = 0
}: AnimatedListItemProps) => {
  const variants = getReducedMotionVariants({
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: index * 0.1,
      }
    },
    exit: { opacity: 0, y: -20 },
  })

  return (
    <motion.div
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  )
}