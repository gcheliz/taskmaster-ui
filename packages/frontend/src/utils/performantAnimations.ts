import { type Variants } from 'framer-motion'

// GPU-accelerated animation variants using only transform and opacity
export const fadeInVariant: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
}

export const slideUpVariant: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    // Force GPU acceleration
    transform: 'translateY(20px) translateZ(0)'
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transform: 'translateY(0px) translateZ(0)',
    transition: { duration: 0.3, ease: 'easeOut' }
  }
}

export const slideDownVariant: Variants = {
  hidden: { 
    opacity: 0, 
    y: -20,
    transform: 'translateY(-20px) translateZ(0)'
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transform: 'translateY(0px) translateZ(0)',
    transition: { duration: 0.3, ease: 'easeOut' }
  }
}

export const scaleVariant: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
    transform: 'scale(0.95) translateZ(0)'
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transform: 'scale(1) translateZ(0)',
    transition: { duration: 0.2, ease: 'easeOut' }
  }
}

// Optimized hover effects without box-shadow
export const hoverLiftOptimized = {
  whileHover: { 
    y: -2,
    scale: 1.02,
    transform: 'translateY(-2px) scale(1.02) translateZ(0)',
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  whileTap: { 
    scale: 0.98,
    transform: 'scale(0.98) translateZ(0)',
    transition: { duration: 0.1 }
  }
}

// Stagger children with optimized timing
export const staggerContainerVariant: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.05,
      // Use spring physics for more natural motion
      type: 'spring',
      stiffness: 400,
      damping: 40
    }
  }
}

export const staggerItemVariant: Variants = {
  hidden: { 
    opacity: 0, 
    y: 10,
    transform: 'translateY(10px) translateZ(0)'
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transform: 'translateY(0px) translateZ(0)'
  }
}

// Reduced motion variants for accessibility
export const reducedMotionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.01 }
  }
}

// Check for reduced motion preference
export const shouldReduceMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Get appropriate variant based on motion preference
export const getMotionVariant = (variant: Variants): Variants => {
  return shouldReduceMotion() ? reducedMotionVariants : variant
}

// Performance monitoring hook
export const useAnimationPerformance = () => {
  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())
  const fps = useRef(60)

  useEffect(() => {
    let animationId: number

    const measureFPS = () => {
      frameCount.current++
      const currentTime = performance.now()
      
      if (currentTime >= lastTime.current + 1000) {
        fps.current = Math.round((frameCount.current * 1000) / (currentTime - lastTime.current))
        frameCount.current = 0
        lastTime.current = currentTime
      }

      animationId = requestAnimationFrame(measureFPS)
    }

    if (process.env.NODE_ENV === 'development') {
      animationId = requestAnimationFrame(measureFPS)
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [])

  return fps.current
}

// Optimized scroll trigger using Intersection Observer
export const useScrollAnimation = (threshold = 0.1) => {
  const ref = useRef<HTMLElement>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      {
        threshold,
        rootMargin: '50px'
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [threshold])

  return { ref, isInView }
}

// Import React hooks
import { useEffect, useRef, useState } from 'react'