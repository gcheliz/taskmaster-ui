import React from 'react'
import { useOutlet } from "react-router"

export const PageTransitionWrapper = () => {
  const outlet = useOutlet()

  return outlet
}