'use client'

import { useReducedMotion } from 'motion/react'

export function useMotionPrefs() {
  const reduced = useReducedMotion() ?? false
  return {
    reduced,
    instant: reduced ? { duration: 0 } : undefined,
  }
}
