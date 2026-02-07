/**
 * MSWサーバーセットアップ（Node.js環境用）
 * Next.jsのServer Actionsから発信されるSupabase HTTPリクエストをインターセプトする
 */

import { setupServer } from 'msw/node'
import { handlers } from './handlers'
import { initStore } from './db'

// インメモリDBを初期化
initStore()

export const server = setupServer(...handlers)
