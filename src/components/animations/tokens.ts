import type { Transition } from 'motion/react'

export const motionDuration = {
  fast: 0.2,
  base: 0.3,
  slow: 0.5,
  count: 0.6,
} as const

export const motionEase = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
}

export const barSpring: Transition = {
  type: 'spring',
  stiffness: 180,
  damping: 26,
  mass: 0.8,
}

export const listSpring: Transition = {
  type: 'spring',
  stiffness: 320,
  damping: 30,
  mass: 0.6,
}

export const listExit: Transition = {
  duration: motionDuration.fast,
  ease: motionEase.out,
}

export const labelSlide = 16
