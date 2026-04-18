'use client'

import dynamic from 'next/dynamic'
import { useMotionPrefs } from './use-motion-prefs'

const DotLottie = dynamic(
  () =>
    import('@lottiefiles/dotlottie-react').then((m) => ({
      default: m.DotLottieReact,
    })),
  { ssr: false, loading: () => null },
)

interface LottiePlayerProps {
  src: string
  className?: string
  loop?: boolean
  autoplay?: boolean
  ariaLabel?: string
}

export function LottiePlayer({
  src,
  className,
  loop = true,
  autoplay = true,
  ariaLabel,
}: LottiePlayerProps) {
  const { reduced } = useMotionPrefs()
  return (
    <DotLottie
      src={src}
      loop={!reduced && loop}
      autoplay={!reduced && autoplay}
      className={className}
      aria-label={ariaLabel}
    />
  )
}
