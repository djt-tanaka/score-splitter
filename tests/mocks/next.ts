import { vi } from 'vitest'

// next/cache のモック
export const mockRevalidatePath = vi.fn()

vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
}))

// next/headers のモック
export const mockCookies = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  getAll: vi.fn(() => []),
}

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => mockCookies),
}))

// next/navigation のモック
export const mockRedirect = vi.fn((path: string) => {
  throw new Error(`NEXT_REDIRECT:${path}`)
})

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}))

// モックのリセット関数
export function resetNextMocks() {
  mockRevalidatePath.mockClear()
  mockCookies.get.mockClear()
  mockCookies.set.mockClear()
  mockCookies.delete.mockClear()
  mockCookies.getAll.mockClear()
  mockRedirect.mockClear()
}
