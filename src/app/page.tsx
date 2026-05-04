import { redirect } from 'next/navigation'

export default function RootPage() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  redirect(`/${year}/${month}`)
}
