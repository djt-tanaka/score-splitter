'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SubmitButtonProps
  extends Omit<React.ComponentProps<typeof Button>, 'type' | 'disabled'> {
  pendingChildren?: React.ReactNode
}

export function SubmitButton({
  children,
  pendingChildren,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? (
        pendingChildren ?? (
          <>
            <Loader2 className="animate-spin" />
            {children}
          </>
        )
      ) : (
        children
      )}
    </Button>
  )
}
