import React from 'react'
import { motion } from 'framer-motion'
import { hoverLift } from '../../utils/animations'

interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  hoverBorderColor?: string
  delay?: number
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
  children, 
  className = '',
  hoverBorderColor,
  delay = 0
}) => {
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0
    },
    exit: { opacity: 0, y: -20 },
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        delay,
        duration: 0.4,
        ease: 'easeOut' as const
      }}
      className={`bg-white rounded-xl border border-gray-200 ${className}`}
      {...hoverLift}
      whileHover={hoverBorderColor ? { borderColor: hoverBorderColor } : undefined}
    >
      {children}
    </motion.div>
  )
}