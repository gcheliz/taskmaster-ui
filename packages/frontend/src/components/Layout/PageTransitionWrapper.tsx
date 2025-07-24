import React from 'react'
import { useOutlet } from 'react-router-dom'

export const PageTransitionWrapper: React.FC = () => {
  const outlet = useOutlet()

  return <>{outlet}</>
}