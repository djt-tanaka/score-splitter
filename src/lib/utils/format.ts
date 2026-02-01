/**
 * 金額を日本円形式でフォーマットする
 * @param amount 金額（円）
 * @returns フォーマットされた文字列（例: ¥1,037,038）
 */
export function formatCurrency(amount: number): string {
  const intAmount = Math.floor(Math.abs(amount))
  const formatted = intAmount.toLocaleString('ja-JP')
  return amount < 0 ? `-¥${formatted}` : `¥${formatted}`
}

/**
 * ISO日付文字列を「YYYY年M月」形式に変換する
 * @param isoDate ISO日付文字列（例: 2026-01-01）
 * @returns フォーマットされた文字列（例: 2026年1月）
 */
export function formatMonth(isoDate: string): string {
  const [year, month] = isoDate.split('-')
  return `${year}年${parseInt(month, 10)}月`
}

/**
 * Dateオブジェクトを月初のISO日付文字列に変換する
 * @param date Dateオブジェクト
 * @returns ISO日付文字列（例: 2026-01-01）
 */
export function parseMonth(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}-01`
}
