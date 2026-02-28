'use client'

import { useFormStatus } from 'react-dom'
import { Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DeleteButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-muted-foreground hover:text-destructive"
      disabled={pending}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  )
}
