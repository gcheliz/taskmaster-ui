import { useEffect, useRef } from 'react'
import { useMotionValue, useTransform, animate } from 'framer-motion'

export const useAnimatedCounter = (value: number, duration: number = 2, delay: number = 0) => {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.round(latest))
  const previousValue = useRef(0)

  useEffect(() => {
    const animation = animate(previousValue.current, value, {
      duration,
      delay,
      onUpdate: (latest) => count.set(latest),
    })

    previousValue.current = value

    return animation.stop
  }, [value, count, duration, delay])

  return rounded
}
