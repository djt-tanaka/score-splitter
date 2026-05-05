import type { Person } from '@/types'

export interface PasskeyInfo {
  id: string
  person: Person
  deviceName: string | null
  createdAt: string
}
