import { test, expect, type Page } from '@playwright/test'

// モックモードではパスワードは "password"
const MOCK_PASSWORD = 'password'

/**
 * ログインしてホームページに遷移するヘルパー
 */
async function login(page: Page) {
  await page.goto('/login')
  await page.getByPlaceholder('パスワード').fill(MOCK_PASSWORD)
  await page.getByRole('button', { name: 'ログイン' }).click()
  await page.waitForURL(/\/(\?|$)/)
}

// =============================================
// ログインページ
// =============================================
test.describe('ログインページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('ログインフォームが表示される', async ({ page }) => {
    await expect(page.getByText('家計計算アプリ')).toBeVisible()
    await expect(page.getByPlaceholder('パスワード')).toBeVisible()
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible()
  })

  test('不正なパスワードでエラーが表示される', async ({ page }) => {
    await page.getByPlaceholder('パスワード').fill('wrong-password')
    await page.getByRole('button', { name: 'ログイン' }).click()

    await expect(
      page.getByText(/パスワードが正しくありません/)
    ).toBeVisible()
  })

  test('正しいパスワードでホームに遷移する', async ({ page }) => {
    await page.getByPlaceholder('パスワード').fill(MOCK_PASSWORD)
    await page.getByRole('button', { name: 'ログイン' }).click()
    await page.waitForURL(/\/(\?|$)/)

    // ホームページの要素を確認
    await expect(page.getByText('収入')).toBeVisible()
  })
})

// =============================================
// ホームページ（認証後）
// =============================================
test.describe('ホームページ', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('ヘッダーが表示される', async ({ page }) => {
    await expect(page.locator('header').getByText('家計計算アプリ')).toBeVisible()
    await expect(page.getByRole('button', { name: /ログアウト/ })).toBeVisible()
  })

  test('全セクションが表示される', async ({ page }) => {
    // 収入セクション
    await expect(page.getByRole('heading', { name: '収入' }).or(page.locator('span').filter({ hasText: /^収入$/ }).first())).toBeVisible()
    // 支出セクション
    await expect(page.getByRole('heading', { name: '支出' }).or(page.locator('span').filter({ hasText: /^支出$/ }).first())).toBeVisible()
    // 繰越セクション
    await expect(page.getByText('繰越（参照用）')).toBeVisible()
    // 精算額セクション
    await expect(page.getByText('精算額')).toBeVisible()
  })

  test('シードデータの収入が表示される', async ({ page }) => {
    // 2026年2月のシードデータを確認（現在の月によってデータが変わる）
    await page.goto('/?month=202602')

    // 収入の項目が表示される
    await expect(page.getByText('給料').first()).toBeVisible()
    await expect(page.getByText('副業')).toBeVisible()

    // 金額が表示される
    await expect(page.getByText('¥350,000').first()).toBeVisible()
    await expect(page.getByText('¥280,000')).toBeVisible()
    await expect(page.getByText('¥50,000')).toBeVisible()
  })

  test('シードデータの支出が表示される', async ({ page }) => {
    await page.goto('/?month=202602')

    await expect(page.getByText('家賃')).toBeVisible()
    await expect(page.getByText('光熱費')).toBeVisible()
    await expect(page.getByText('食費')).toBeVisible()
    await expect(page.getByText('日用品')).toBeVisible()
    await expect(page.getByText('通信費')).toBeVisible()
  })

  test('精算額と収支詳細が表示される', async ({ page }) => {
    await page.goto('/?month=202602')

    // 精算額のセクションが存在
    await expect(page.getByText('精算額')).toBeVisible()

    // 収支詳細
    await expect(page.getByText('収支詳細')).toBeVisible()
    await expect(page.getByText('収入合計')).toBeVisible()
    await expect(page.getByText('支出合計')).toBeVisible()
    await expect(page.getByText('夫の支出')).toBeVisible()
    await expect(page.getByText('妻の支出')).toBeVisible()
    await expect(page.getByText('お小遣い（1人あたり）')).toBeVisible()
  })

  test('精算額の計算結果が正しい', async ({ page }) => {
    await page.goto('/?month=202602')

    // シードデータ:
    // 収入: 夫350000+50000=400000, 妻280000 → 合計680000
    // 支出: 夫-120000-15000-12000=-147000, 妻-50000-8000=-58000 → 合計-205000
    // 夫合計: 400000-147000=253000
    // 妻合計: 280000-58000=222000
    // お小遣い: (680000-205000)/2 = 237500
    // 精算: 253000-237500 = 15500 (夫→妻)

    await expect(page.getByText('¥15,500').first()).toBeVisible()
    await expect(page.getByText('夫 → 妻')).toBeVisible()
  })
})

// =============================================
// 月ナビゲーション
// =============================================
test.describe('月ナビゲーション', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/?month=202602')
  })

  test('現在の月が表示される', async ({ page }) => {
    await expect(page.getByText('2026年2月')).toBeVisible()
  })

  test('前月に移動できる', async ({ page }) => {
    // 左矢印ボタンをクリック
    await page.locator('button').filter({ has: page.locator('svg.lucide-chevron-left') }).click()

    await expect(page).toHaveURL(/month=202601/)
    await expect(page.getByText('2026年1月')).toBeVisible()
  })

  test('翌月に移動できる', async ({ page }) => {
    // 右矢印ボタンをクリック
    await page.locator('button').filter({ has: page.locator('svg.lucide-chevron-right') }).click()

    await expect(page).toHaveURL(/month=202603/)
    await expect(page.getByText('2026年3月')).toBeVisible()
  })

  test('前月に移動するとデータが変わる', async ({ page }) => {
    // 2月のデータを確認
    await expect(page.getByText('副業')).toBeVisible()

    // 1月に移動
    await page.locator('button').filter({ has: page.locator('svg.lucide-chevron-left') }).click()
    await page.waitForURL(/month=202601/)

    // 1月には副業がない
    await expect(page.getByText('副業')).not.toBeVisible()
  })

  test('データのない月では空メッセージが表示される', async ({ page }) => {
    // 2026年3月に移動（データなし）
    await page.locator('button').filter({ has: page.locator('svg.lucide-chevron-right') }).click()
    await page.waitForURL(/month=202603/)

    await expect(page.getByText('収入がありません')).toBeVisible()
    await expect(page.getByText('支出がありません')).toBeVisible()
  })
})

// =============================================
// 収入のCRUD操作
// =============================================
test.describe('収入の追加', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    // データのない月で操作する
    await page.goto('/?month=202612')
  })

  test('収入を追加できる', async ({ page }) => {
    // 収入セクションのフォームに入力
    const incomeCard = page.locator('.glow-sm').filter({ hasText: '収入を追加' })
    await incomeCard.getByPlaceholder('項目名').fill('テスト給料')
    await incomeCard.getByPlaceholder('金額').fill('300000')
    await incomeCard.getByRole('button', { name: '収入を追加' }).click()

    // 追加された項目が表示されることを確認
    await expect(page.getByText('テスト給料')).toBeVisible()
    await expect(page.getByText('¥300,000')).toBeVisible()
  })

  test('担当者を妻にして収入を追加できる', async ({ page }) => {
    const incomeCard = page.locator('.glow-sm').filter({ hasText: '収入を追加' })
    await incomeCard.getByPlaceholder('項目名').fill('妻のパート')
    await incomeCard.getByPlaceholder('金額').fill('150000')

    // 担当者を妻に変更
    await incomeCard.locator('[role="combobox"]').click()
    await page.getByRole('option', { name: '妻' }).click()

    await incomeCard.getByRole('button', { name: '収入を追加' }).click()

    await expect(page.getByText('妻のパート')).toBeVisible()
    await expect(page.getByText('¥150,000')).toBeVisible()
  })
})

// =============================================
// 支出のCRUD操作
// =============================================
test.describe('支出の追加', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/?month=202612')
  })

  test('支出を追加できる', async ({ page }) => {
    const expenseCard = page.locator('.glow-sm').filter({ hasText: '支出を追加' })
    await expenseCard.getByPlaceholder('項目名').fill('テスト家賃')
    await expenseCard.getByPlaceholder('金額').fill('100000')
    await expenseCard.getByRole('button', { name: '支出を追加' }).click()

    await expect(page.getByText('テスト家賃')).toBeVisible()
  })
})

// =============================================
// 繰越のCRUD操作
// =============================================
test.describe('繰越の追加', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/?month=202612')
  })

  test('繰越セクションを開いて追加できる', async ({ page }) => {
    // 繰越セクションはCollapsibleなのでクリックで展開
    await page.getByText('繰越（参照用）').click()

    // フォームが表示される
    await expect(page.getByRole('button', { name: '繰越を追加' })).toBeVisible()

    // 繰越を追加
    const carryoverContent = page.locator('.glow-sm').filter({ hasText: '繰越を追加' })
    await carryoverContent.getByPlaceholder('項目名').fill('テスト繰越')
    await carryoverContent.getByPlaceholder('金額').fill('5000')
    await carryoverContent.getByRole('button', { name: '繰越を追加' }).click()

    await expect(page.getByText('テスト繰越')).toBeVisible()
  })
})

// =============================================
// 項目の編集
// =============================================
test.describe('項目の編集', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/?month=202602')
  })

  test('収入を編集できる', async ({ page }) => {
    // 副業の行の編集ボタン（Pencilアイコン）をクリック
    const row = page.locator('div').filter({ hasText: /^副業/ }).first()
    await row.locator('button').filter({ has: page.locator('svg.lucide-pencil') }).click()

    // 編集ダイアログが表示される
    await expect(page.getByText('収入を編集')).toBeVisible()

    // 項目名を変更
    const labelInput = page.getByRole('dialog').locator('input[name="label"]')
    await labelInput.clear()
    await labelInput.fill('副業収入（更新）')

    // 更新ボタンをクリック
    await page.getByRole('dialog').getByRole('button', { name: '更新' }).click()

    // ダイアログが閉じて更新された項目名が表示される
    await expect(page.getByText('副業収入（更新）')).toBeVisible()
  })

  test('編集ダイアログのキャンセルが動作する', async ({ page }) => {
    const row = page.locator('div').filter({ hasText: /^副業/ }).first()
    await row.locator('button').filter({ has: page.locator('svg.lucide-pencil') }).click()

    await expect(page.getByText('収入を編集')).toBeVisible()

    // キャンセル
    await page.getByRole('dialog').getByRole('button', { name: 'キャンセル' }).click()

    // ダイアログが閉じる
    await expect(page.getByText('収入を編集')).not.toBeVisible()
  })
})

// =============================================
// 項目の削除
// =============================================
test.describe('項目の削除', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/?month=202602')
  })

  test('収入を削除できる', async ({ page }) => {
    // 副業が表示されていることを確認
    await expect(page.getByText('副業')).toBeVisible()

    // 副業の行の削除ボタン（Trash2アイコン）をクリック
    const row = page.locator('div').filter({ hasText: /^副業/ }).first()
    await row.locator('button').filter({ has: page.locator('svg.lucide-trash-2') }).click()

    // ページがリロードされ副業が消える
    await expect(page.getByText('副業')).not.toBeVisible({ timeout: 5000 })
  })
})

// =============================================
// 精算額の動的更新
// =============================================
test.describe('精算額の更新', () => {
  test('収入追加後に精算額が更新される', async ({ page }) => {
    await login(page)
    // データのない月で開始
    await page.goto('/?month=202611')

    // 初期状態: 精算なし
    await expect(page.getByText('精算なし')).toBeVisible()

    // 夫の収入を追加
    const incomeCard = page.locator('.glow-sm').filter({ hasText: '収入を追加' })
    await incomeCard.getByPlaceholder('項目名').fill('給料')
    await incomeCard.getByPlaceholder('金額').fill('400000')
    await incomeCard.getByRole('button', { name: '収入を追加' }).click()

    // 精算額が更新される（夫のみの収入なので夫→妻方向）
    await expect(page.getByText('夫 → 妻')).toBeVisible()
  })
})

// =============================================
// 前月からコピー
// =============================================
test.describe('前月からコピー', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/?month=202602')
  })

  test('コピーダイアログが表示される', async ({ page }) => {
    await page.getByRole('button', { name: '前月からコピー' }).click()

    await expect(page.getByText('前月からデータをコピー')).toBeVisible()
    // コピー元→コピー先の月が表示
    await expect(page.getByText('2026年1月')).toBeVisible()
    await expect(page.getByText('2026年2月')).toBeVisible()
  })

  test('コピーダイアログに前月のデータが表示される', async ({ page }) => {
    await page.getByRole('button', { name: '前月からコピー' }).click()

    // プレビューが読み込まれるのを待つ
    await expect(page.getByText('コピー対象を選択')).toBeVisible()

    // 前月（2026年1月）のデータが表示されるか確認
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('収入')).toBeVisible()
  })

  test('コピーダイアログのキャンセルが動作する', async ({ page }) => {
    await page.getByRole('button', { name: '前月からコピー' }).click()
    await expect(page.getByText('前月からデータをコピー')).toBeVisible()

    await page.getByRole('dialog').getByRole('button', { name: 'キャンセル' }).click()
    await expect(page.getByText('前月からデータをコピー')).not.toBeVisible()
  })
})

// =============================================
// ログアウト
// =============================================
test.describe('ログアウト', () => {
  test('ログアウトするとログインページに遷移する', async ({ page }) => {
    await login(page)

    await page.getByRole('button', { name: /ログアウト/ }).click()

    // ログインページにリダイレクト
    await page.waitForURL(/\/login/)
    await expect(page.getByPlaceholder('パスワード')).toBeVisible()
  })

  test('ログアウト後にホームにアクセスするとログインページにリダイレクトされる', async ({ page }) => {
    await login(page)
    await page.getByRole('button', { name: /ログアウト/ }).click()
    await page.waitForURL(/\/login/)

    // ホームページに直接アクセス
    await page.goto('/')
    await page.waitForURL(/\/login/)

    await expect(page.getByPlaceholder('パスワード')).toBeVisible()
  })
})

// =============================================
// 認証ガード
// =============================================
test.describe('認証ガード', () => {
  test('未ログインでホームにアクセスするとログインページにリダイレクト', async ({ page }) => {
    await page.goto('/')
    await page.waitForURL(/\/login/)
    await expect(page.getByPlaceholder('パスワード')).toBeVisible()
  })

  test('ログイン済みでログインページにアクセスするとホームにリダイレクト', async ({ page }) => {
    await login(page)
    await page.goto('/login')
    await page.waitForURL(/\/(\?|$)/)
  })
})

// =============================================
// テーマ切り替え
// =============================================
test.describe('テーマ切り替え', () => {
  test('テーマ切り替えボタンが存在する', async ({ page }) => {
    await login(page)

    // テーマ切り替えボタン（Sun/MoonアイコンのButton）
    const themeButton = page.locator('header button').filter({
      has: page.locator('svg.lucide-sun, svg.lucide-moon'),
    })
    await expect(themeButton).toBeVisible()
  })
})
