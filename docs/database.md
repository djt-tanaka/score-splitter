# データベース設計

## 概要

Supabase（PostgreSQL）を使用したデータベース設計です。

## テーブル構造

### incomes（収入テーブル）

| カラム | 型 | 説明 |
|-------|---|------|
| id | UUID | 主キー（自動生成） |
| month | VARCHAR(6) | 対象月（YYYYMM形式） |
| label | VARCHAR(255) | 項目名 |
| amount | INTEGER | 金額（正の値） |
| person | VARCHAR(10) | 担当者（'husband' / 'wife'） |
| created_at | TIMESTAMPTZ | 作成日時 |
| updated_at | TIMESTAMPTZ | 更新日時 |

### expenses（支出テーブル）

| カラム | 型 | 説明 |
|-------|---|------|
| id | UUID | 主キー（自動生成） |
| month | VARCHAR(6) | 対象月（YYYYMM形式） |
| label | VARCHAR(255) | 項目名 |
| amount | INTEGER | 金額（**負の値**） |
| person | VARCHAR(10) | 担当者（'husband' / 'wife'） |
| created_at | TIMESTAMPTZ | 作成日時 |
| updated_at | TIMESTAMPTZ | 更新日時 |

### carryovers（繰越テーブル）

| カラム | 型 | 説明 |
|-------|---|------|
| id | UUID | 主キー（自動生成） |
| month | VARCHAR(6) | 対象月（YYYYMM形式） |
| label | VARCHAR(255) | 項目名 |
| amount | INTEGER | 金額（**負の値**） |
| person | VARCHAR(10) | 担当者（'husband' / 'wife'） |
| created_at | TIMESTAMPTZ | 作成日時 |
| updated_at | TIMESTAMPTZ | 更新日時 |

## 型定義（TypeScript）

```typescript
type Person = 'husband' | 'wife'

interface Income {
  id: string
  month: string      // 'YYYYMM'形式
  label: string
  amount: number     // 正の値
  person: Person
  created_at: string
}

interface Expense {
  id: string
  month: string
  label: string
  amount: number     // 負の値
  person: Person
  created_at: string
}

interface Carryover {
  id: string
  month: string
  label: string
  amount: number     // 負の値
  person: Person
  created_at: string
}
```

## 設計上の注意点

### 金額の符号

| テーブル | 符号 | 理由 |
|---------|-----|------|
| incomes | 正 | 収入は加算されるため |
| expenses | 負 | 支出は減算されるため |
| carryovers | 負 | 繰越は支出として扱うため |

入力時は正の値で入力し、サーバーサイドで負の値に変換して保存します。

### 月の形式

アプリケーション内およびデータベースでは `YYYYMM` 形式（6桁の数字）を使用します。

```typescript
// 例: 2024年3月
const month = '202403'

// URL例: /?month=202403
```

### インデックス

月別検索の高速化のため、`month`カラムにインデックスを設定しています。

## Row Level Security (RLS)

全テーブルでRLSを有効化し、ポリシーを設定していない状態（= 全拒否）にしています。サーバー側ではservice role keyを使用してRLSをバイパスし、Server Actions経由でのみデータアクセスを許可しています。anon keyでの直接アクセスは全て拒否されます。

## マイグレーション

マイグレーションファイルは `supabase/migrations/` に配置されています。

```
supabase/migrations/
├── 001_initial_schema.sql           # 初期スキーマ
├── 002_change_month_to_varchar.sql  # 月カラムをVARCHAR(6)に変更
└── 003_restrict_rls_policies.sql    # RLSポリシーを全削除（全拒否化）
```

## トリガー

`updated_at` カラムは、レコード更新時にトリガーで自動更新されます。
