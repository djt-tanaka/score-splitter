/**
 * MSWハンドラー: Supabase PostgREST APIをインターセプト
 *
 * Supabase JSクライアントは内部的にPostgREST REST APIを使う。
 * URL形式: {SUPABASE_URL}/rest/v1/{table}?select=...&column=eq.value&order=...
 */

import { http, HttpResponse } from 'msw'
import {
  getTable,
  applyFilters,
  applyOrder,
  applySelect,
  insertRows,
  updateRows,
  deleteRows,
} from './db'

// PostgRESTの予約クエリパラメータ（フィルタではない）
const RESERVED_PARAMS = new Set(['select', 'order', 'limit', 'offset', 'on_conflict'])

/**
 * URLのクエリパラメータからフィルタ条件を抽出
 * select, order等の予約パラメータを除外し、column=operator.value 形式のみ抽出
 */
function extractFilters(searchParams: URLSearchParams): Record<string, string> {
  const filters: Record<string, string> = {}
  for (const [key, value] of searchParams.entries()) {
    if (!RESERVED_PARAMS.has(key) && value.includes('.')) {
      filters[key] = value
    }
  }
  return filters
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://mock-supabase.local'

export const handlers = [
  // GET: SELECT クエリ
  http.get(`${SUPABASE_URL}/rest/v1/:table`, ({ params, request }) => {
    const table = params.table as string
    const url = new URL(request.url)

    const selectParam = url.searchParams.get('select') || '*'
    const orderParam = url.searchParams.get('order')
    const filters = extractFilters(url.searchParams)

    let rows = getTable(table)
    rows = applyFilters([...rows], filters)
    if (orderParam) {
      rows = applyOrder(rows, orderParam)
    }
    rows = applySelect(rows, selectParam)

    // Prefer: count=exact ヘッダーの場合、Content-Rangeにカウントを含める
    const prefer = request.headers.get('Prefer') || ''
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (prefer.includes('count=exact')) {
      headers['Content-Range'] = `0-${Math.max(0, rows.length - 1)}/${rows.length}`
    }

    // Accept: application/vnd.pgrst.object+json → 単一オブジェクトを返す
    const accept = request.headers.get('Accept') || ''
    if (accept.includes('application/vnd.pgrst.object+json')) {
      if (rows.length === 0) {
        return new HttpResponse(
          JSON.stringify({
            message: 'JSON object requested, multiple (or no) rows returned',
            details: 'Results contain 0 rows',
          }),
          { status: 406, headers: { 'Content-Type': 'application/json' } }
        )
      }
      return HttpResponse.json(rows[0], { headers })
    }

    return HttpResponse.json(rows, { headers })
  }),

  // HEAD: COUNT クエリ (head: true)
  http.head(`${SUPABASE_URL}/rest/v1/:table`, ({ params, request }) => {
    const table = params.table as string
    const url = new URL(request.url)
    const filters = extractFilters(url.searchParams)

    let rows = getTable(table)
    rows = applyFilters([...rows], filters)

    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Content-Range': `*/${rows.length}`,
      },
    })
  }),

  // POST: INSERT
  http.post(`${SUPABASE_URL}/rest/v1/:table`, async ({ params, request }) => {
    const table = params.table as string
    const body = await request.json()
    const rowsToInsert = Array.isArray(body) ? body : [body]

    const inserted = insertRows(table, rowsToInsert as Record<string, unknown>[])

    const prefer = request.headers.get('Prefer') || ''
    const accept = request.headers.get('Accept') || ''

    // return=representation: 挿入されたデータを返す
    if (prefer.includes('return=representation')) {
      if (accept.includes('application/vnd.pgrst.object+json')) {
        return HttpResponse.json(inserted[0], { status: 201 })
      }
      return HttpResponse.json(inserted, { status: 201 })
    }

    // return=minimal: 空レスポンス
    return new HttpResponse(null, { status: 201 })
  }),

  // PATCH: UPDATE
  http.patch(`${SUPABASE_URL}/rest/v1/:table`, async ({ params, request }) => {
    const table = params.table as string
    const url = new URL(request.url)
    const filters = extractFilters(url.searchParams)
    const body = (await request.json()) as Record<string, unknown>

    const updated = updateRows(table, filters, body)

    const prefer = request.headers.get('Prefer') || ''
    const accept = request.headers.get('Accept') || ''

    if (prefer.includes('return=representation')) {
      if (accept.includes('application/vnd.pgrst.object+json')) {
        if (updated.length === 0) {
          return new HttpResponse(
            JSON.stringify({
              message: 'JSON object requested, multiple (or no) rows returned',
              details: 'Results contain 0 rows',
            }),
            { status: 406, headers: { 'Content-Type': 'application/json' } }
          )
        }
        return HttpResponse.json(updated[0], { status: 200 })
      }
      return HttpResponse.json(updated, { status: 200 })
    }

    return new HttpResponse(null, { status: 204 })
  }),

  // DELETE
  http.delete(`${SUPABASE_URL}/rest/v1/:table`, ({ params, request }) => {
    const table = params.table as string
    const url = new URL(request.url)
    const filters = extractFilters(url.searchParams)

    deleteRows(table, filters)

    return new HttpResponse(null, { status: 204 })
  }),
]
