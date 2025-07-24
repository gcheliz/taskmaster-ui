import type { Variants } from 'framer-motion'

// Animation Variants
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const slideUp: Variants = {
  initial: { 
    opacity: 0, 
    y: 20,
    transform: 'translateY(20px) translateZ(0)' // Force GPU acceleration
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transform: 'translateY(0px) translateZ(0)'
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transform: 'translateY(-20px) translateZ(0)'
  },
}

export const slideDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
}

export const slideLeft: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

export const slideRight: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
}

export const scale: Variants = {
  initial: { 
    opacity: 0, 
    scale: 0.95,
    transform: 'scale(0.95) translateZ(0)' // GPU acceleration
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    transform: 'scale(1) translateZ(0)'
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transform: 'scale(0.95) translateZ(0)'
  },
}

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
}

// Animation Transitions
export const springTransition = {
  type: 'spring',
  stiffness: 260,
  damping: 20,
}

export const smoothTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.3,
}

export const quickTransition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.2,
}

// Custom motion components presets
export const motionPresets = {
  fade: {
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
    variants: fadeIn,
    transition: smoothTransition,
  },
  slideUp: {
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
    variants: slideUp,
    transition: smoothTransition,
  },
  scale: {
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
    variants: scale,
    transition: springTransition,
  },
}

// Reduced motion support
export const getReducedMotionVariants = (variants: Variants): Variants => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  
  if (!prefersReducedMotion) {
    return variants
  }
  
  // Return variants with instant transitions for reduced motion
  return {
    initial: variants.initial,
    animate: variants.animate,
    exit: variants.exit,
  }
}

// Hover animations
export const hoverScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: springTransition,
}

// Optimized hover effect without expensive box-shadow animation
export const hoverLift = {
  whileHover: { 
    y: -2,
    scale: 1.02,
    transform: 'translateY(-2px) scale(1.02) translateZ(0)'
  },
  whileTap: { 
    scale: 0.98,
    transform: 'scale(0.98) translateZ(0)'
  },
  transition: smoothTransition,
}

// Focus animations - using outline instead of box-shadow for better performance
export const focusRing = {
  whileFocus: {
    outline: '3px solid rgba(59, 130, 246, 0.5)',
    outlineOffset: '2px',
  },
  transition: quickTransition,
}

// Performance-optimized variants
export const optimizedVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  },
  item: {
    hidden: { 
      opacity: 0, 
      y: 10,
      transform: 'translateY(10px) translateZ(0)'
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transform: 'translateY(0px) translateZ(0)'
    },
  },
}