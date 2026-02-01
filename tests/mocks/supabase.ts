import { vi, type Mock } from 'vitest'

// Supabaseのレスポンス型
export interface SupabaseResponse<T = unknown> {
  data: T | null
  error: { message: string; code?: string } | null
}

// チェーンメソッドのモック型
export interface MockQueryBuilder {
  select: Mock
  insert: Mock
  update: Mock
  delete: Mock
  eq: Mock
  neq: Mock
  order: Mock
  single: Mock
}

// モッククエリビルダーを作成
export function createMockQueryBuilder(): MockQueryBuilder {
  const builder: MockQueryBuilder = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    neq: vi.fn(),
    order: vi.fn(),
    single: vi.fn(),
  }

  // 各メソッドがビルダー自身を返すように設定
  builder.select.mockReturnValue(builder)
  builder.insert.mockReturnValue(builder)
  builder.update.mockReturnValue(builder)
  builder.delete.mockReturnValue(builder)
  builder.eq.mockReturnValue(builder)
  builder.neq.mockReturnValue(builder)
  builder.order.mockReturnValue(builder)

  return builder
}

// モッククライアント型
export interface MockSupabaseClient {
  from: Mock
  _queryBuilder: MockQueryBuilder
}

// モッククライアントを作成
export function createMockSupabaseClient(): MockSupabaseClient {
  const queryBuilder = createMockQueryBuilder()

  return {
    from: vi.fn(() => queryBuilder),
    _queryBuilder: queryBuilder,
  }
}

// グローバルモッククライアント
export let mockSupabaseClient = createMockSupabaseClient()

// モッククライアントをリセット（新しいインスタンスを作成）
export function resetMockSupabaseClient() {
  mockSupabaseClient = createMockSupabaseClient()
}

// @/lib/supabase/server のモック
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => mockSupabaseClient),
}))

// SELECT用: 配列を返す（order()の結果として）
export function mockSelectSuccess<T>(data: T[]) {
  mockSupabaseClient._queryBuilder.order.mockResolvedValueOnce({
    data,
    error: null,
  })
}

// SELECT用: エラーを返す
export function mockSelectError(message: string) {
  mockSupabaseClient._queryBuilder.order.mockResolvedValueOnce({
    data: null,
    error: { message },
  })
}

// INSERT/UPDATE用: 単一レコードを返す（single()の結果として）
export function mockSingleSuccess<T>(data: T) {
  mockSupabaseClient._queryBuilder.single.mockResolvedValueOnce({
    data,
    error: null,
  })
}

// INSERT/UPDATE用: エラーを返す
export function mockSingleError(message: string) {
  mockSupabaseClient._queryBuilder.single.mockResolvedValueOnce({
    data: null,
    error: { message },
  })
}

// DELETE用: 成功を返す（eq()の結果として）
export function mockDeleteSuccess() {
  mockSupabaseClient._queryBuilder.eq.mockResolvedValueOnce({
    data: null,
    error: null,
  })
}

// DELETE用: エラーを返す
export function mockDeleteError(message: string) {
  mockSupabaseClient._queryBuilder.eq.mockResolvedValueOnce({
    data: null,
    error: { message },
  })
}

// すべてのモックをクリア
export function clearSupabaseMocks() {
  const qb = mockSupabaseClient._queryBuilder
  mockSupabaseClient.from.mockClear()
  qb.select.mockClear()
  qb.insert.mockClear()
  qb.update.mockClear()
  qb.delete.mockClear()
  qb.eq.mockClear()
  qb.neq.mockClear()
  qb.order.mockClear()
  qb.single.mockClear()
}
