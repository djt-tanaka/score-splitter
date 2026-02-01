# アーキテクチャ・ディレクトリ構造

## ディレクトリ構造

```
score-splitter/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── actions/              # Server Actions
│   │   │   ├── auth.ts           # 認証処理
│   │   │   ├── income.ts         # 収入CRUD
│   │   │   ├── expense.ts        # 支出CRUD
│   │   │   ├── carryover.ts      # 繰越CRUD
│   │   │   └── copy-month.ts     # 月コピー機能
│   │   ├── login/                # ログインページ
│   │   ├── layout.tsx            # ルートレイアウト
│   │   ├── page.tsx              # ホームページ
│   │   └── globals.css           # グローバルスタイル
│   │
│   ├── components/
│   │   ├── features/             # 機能コンポーネント
│   │   │   └── copy-month-dialog.tsx
│   │   ├── forms/                # フォームコンポーネント
│   │   │   ├── entry-form.tsx
│   │   │   └── edit-dialog.tsx
│   │   ├── layout/               # レイアウトコンポーネント
│   │   │   ├── header.tsx
│   │   │   └── month-selector.tsx
│   │   ├── sections/             # ページセクション
│   │   │   ├── income-section.tsx
│   │   │   ├── expense-section.tsx
│   │   │   ├── carryover-section.tsx
│   │   │   └── calculation-section.tsx
│   │   └── ui/                   # UIコンポーネント（shadcn/ui）
│   │
│   ├── lib/
│   │   ├── supabase/             # Supabase設定
│   │   │   ├── client.ts         # クライアント用
│   │   │   └── server.ts         # サーバー用
│   │   ├── utils/                # ユーティリティ
│   │   │   ├── calculation.ts    # 計算ロジック
│   │   │   └── format.ts         # フォーマット関数
│   │   └── validations/          # バリデーション
│   │       ├── income.ts
│   │       ├── expense.ts
│   │       └── carryover.ts
│   │
│   ├── types/
│   │   └── index.ts              # 型定義
│   │
│   └── middleware.ts             # 認証ミドルウェア
│
├── tests/
│   ├── unit/                     # ユニットテスト
│   ├── integration/              # 統合テスト
│   ├── components/               # コンポーネントテスト
│   ├── e2e/                      # E2Eテスト
│   ├── mocks/                    # モック・フィクスチャ
│   └── setup.ts                  # テストセットアップ
│
├── supabase/
│   └── migrations/               # DBマイグレーション
│       └── 001_initial_schema.sql
│
├── public/                       # 静的アセット
│
└── 設定ファイル群
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    ├── vitest.config.ts
    ├── playwright.config.ts
    ├── eslint.config.mjs
    ├── postcss.config.mjs
    └── components.json
```

## アーキテクチャパターン

### Server Components + Server Actions

Next.js 16のApp Routerを使用し、Server ComponentsとServer Actionsを中心としたアーキテクチャを採用しています。

```
[クライアント] ─→ [Server Component] ─→ [Server Action] ─→ [Supabase DB]
```

### レイヤー構成

1. **プレゼンテーション層**: `components/`
   - UI表示とユーザーインタラクション

2. **アプリケーション層**: `app/actions/`
   - ビジネスロジックとデータ操作

3. **ドメイン層**: `lib/utils/`, `lib/validations/`
   - 計算ロジック、バリデーション

4. **インフラ層**: `lib/supabase/`
   - データベース接続、認証

### 認証フロー

```
リクエスト
    ↓
middleware.ts（認証チェック）
    ↓
├── 認証済み → ページ表示
└── 未認証 → /login へリダイレクト
```
