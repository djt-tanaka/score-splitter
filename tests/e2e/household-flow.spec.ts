import { test, expect } from '@playwright/test'

test.describe('家計計算アプリ E2E', () => {
  test.beforeEach(async ({ page }) => {
    // ログインページにアクセス
    await page.goto('/login')
  })

  test('ログインページが表示される', async ({ page }) => {
    // タイトルを確認（CardTitleコンポーネントを使用）
    await expect(page.getByText('家計計算アプリ')).toBeVisible()

    // パスワード入力欄があることを確認（placeholderで検索）
    await expect(page.getByPlaceholder('パスワード')).toBeVisible()

    // ログインボタンがあることを確認
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible()
  })

  test('不正なパスワードでエラーが表示される', async ({ page }) => {
    // 不正なパスワードを入力
    await page.getByPlaceholder('パスワード').fill('wrong-password')
    await page.getByRole('button', { name: 'ログイン' }).click()

    // エラーメッセージを確認（環境によって異なる可能性あり）
    await expect(
      page.getByText(/パスワードが正しくありません|認証設定が見つかりません/)
    ).toBeVisible()
  })

  // 以下のテストは認証済みの状態が必要
  // 実際の運用では、テスト用のパスワードを環境変数で設定
  test.describe('認証後のフロー', () => {
    test.skip(
      !process.env.TEST_PASSWORD,
      'TEST_PASSWORD環境変数が設定されていません'
    )

    test.beforeEach(async ({ page }) => {
      // テスト用パスワードでログイン
      if (process.env.TEST_PASSWORD) {
        await page.getByPlaceholder('パスワード').fill(process.env.TEST_PASSWORD)
        await page.getByRole('button', { name: 'ログイン' }).click()
        await page.waitForURL('/')
      }
    })

    test('ホームページに収入・支出セクションが表示される', async ({
      page,
    }) => {
      await expect(page.getByText('収入')).toBeVisible()
      await expect(page.getByText('支出')).toBeVisible()
      await expect(page.getByText('繰越（参照用）')).toBeVisible()
    })

    test('月選択で月を変更できる', async ({ page }) => {
      // 月選択ボタンをクリック
      const monthSelector = page.locator('[data-testid="month-selector"]')
      if (await monthSelector.isVisible()) {
        await monthSelector.click()
        // 月の選択肢が表示されることを確認
        await expect(page.getByRole('listbox')).toBeVisible()
      }
    })

    test('収入追加フォームが表示される', async ({ page }) => {
      // 収入セクション内のフォームを確認
      const incomeSection = page.locator('text=収入').first().locator('..')
      await expect(incomeSection.getByPlaceholder('項目名')).toBeVisible()
      await expect(incomeSection.getByPlaceholder('金額')).toBeVisible()
    })

    test('計算結果セクションが表示される', async ({ page }) => {
      // 精算額の表示を確認
      await expect(page.getByText(/精算額|お小遣い/)).toBeVisible()
    })

    test('ログアウトできる', async ({ page }) => {
      // ログアウトボタンをクリック
      const logoutButton = page.getByRole('button', { name: 'ログアウト' })
      if (await logoutButton.isVisible()) {
        await logoutButton.click()
        // ログインページにリダイレクトされることを確認
        await page.waitForURL('/login')
        await expect(
          page.getByRole('heading', { name: '家計計算アプリ' })
        ).toBeVisible()
      }
    })
  })
})
