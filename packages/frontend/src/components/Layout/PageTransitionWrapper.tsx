import React from 'react'
import { useOutlet } from 'react-router-dom'

export const PageTransitionWrapper = () => {
  const outlet = useOutlet()

  return <>{outlet}</>
}