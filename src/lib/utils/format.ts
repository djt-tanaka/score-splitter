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
 * 月文字列を「YYYY年M月」形式に変換する
 * @param month 月文字列（例: 202601）
 * @returns フォーマットされた文字列（例: 2026年1月）
 */
export function formatMonth(month: string): string {
  const year = month.slice(0, 4)
  const m = parseInt(month.slice(4, 6), 10)
  return `${year}年${m}月`
}

/**
 * Dateオブジェクトを月文字列に変換する
 * @param date Dateオブジェクト
 * @returns 月文字列（例: 202601）
 */
export function parseMonth(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}${month}`
}

/**
 * 指定月の1ヶ月前を返す
 * @param month 月文字列（例: 202602）
 * @returns 1ヶ月前の月文字列（例: 202601）
 */
export function getPreviousMonth(month: string): string {
  const year = parseInt(month.slice(0, 4), 10)
  const m = parseInt(month.slice(4, 6), 10)
  const date = new Date(year, m - 2, 1)
  return parseMonth(date)
}
