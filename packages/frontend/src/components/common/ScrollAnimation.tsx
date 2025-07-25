import React, { useRef, useState, useEffect } from 'react'
import { motion, type Variants } from 'framer-motion'
import { useReducedMotion } from '../../hooks/useReducedMotion'

interface ScrollAnimationProps {
  children: React.ReactNode
  className?: string
  threshold?: number
  rootMargin?: string
  animateOnce?: boolean
  variants?: Variants
  delay?: number
}

const defaultVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 50,
    transform: 'translateY(50px) translateZ(0)'
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transform: 'translateY(0px) translateZ(0)',
    transition: {
      duration: 0.6,
      ease: 'easeOut'
    }
  }
}

export const ScrollAnimation = ({
  children,
  className = '',
  threshold = 0.1,
  rootMargin = '0px',
  animateOnce = true,
  variants = defaultVariants,
  delay = 0
}: ScrollAnimationProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    const element = ref.current
    if (!element || prefersReducedMotion) {
      setIsInView(true) // Show content immediately if reduced motion
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting
        
        if (inView && animateOnce && hasAnimated) {
          return // Don't animate again if animateOnce is true
        }
        
        setIsInView(inView)
        if (inView) {
          setHasAnimated(true)
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [threshold, rootMargin, animateOnce, hasAnimated, prefersReducedMotion])

  const animationVariants = prefersReducedMotion ? {
    hidden: { opacity: 1 },
    visible: { opacity: 1 }
  } : variants

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={animationVariants}
      className={`${className} ${prefersReducedMotion ? '' : 'will-animate-transform'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </motion.div>
  )
}

// Stagger children animation wrapper
interface ScrollStaggerProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
  threshold?: number
}

export const ScrollStagger = ({
  children,
  className = '',
  staggerDelay = 0.1,
  threshold = 0.1
}: ScrollStaggerProps) => {
  const childrenArray = React.Children.toArray(children)
  
  return (
    <div className={className}>
      {childrenArray.map((child, index) => (
        <ScrollAnimation
          key={index}
          delay={index * staggerDelay * 1000}
          threshold={threshold}
        >
          {child}
        </ScrollAnimation>
      ))}
    </div>
  )
}