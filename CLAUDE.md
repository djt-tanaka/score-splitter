# CLAUDE.md

このファイルはClaude Codeがプロジェクトを理解するためのガイドです。

## プロジェクト概要

夫婦間の家計を管理・精算するWebアプリケーション。毎月の収入・支出・繰越を記録し、精算金額を自動計算する。

詳細: [docs/README.md](docs/README.md)

## よく使うコマンド

```bash
# 開発
npm run dev          # 開発サーバー起動 (localhost:3000)
npm run build        # 本番ビルド
npm run lint         # ESLint実行

# テスト
npm run test         # Vitestウォッチモード
npm run test:run     # 単発実行
npm run test:coverage # カバレッジ測定
npm run test:e2e     # Playwright E2Eテスト
```

## ディレクトリ構成

```
src/
├── app/actions/     # Server Actions (認証、CRUD)
├── components/
│   ├── ui/          # shadcn/ui コンポーネント
│   ├── sections/    # ページセクション
│   ├── forms/       # フォーム
│   └── features/    # 機能コンポーネント
├── lib/
│   ├── supabase/    # Supabase設定
│   ├── utils/       # ユーティリティ (計算、フォーマット)
│   └── validations/ # Zodスキーマ
└── types/           # 型定義
tests/
├── unit/            # ユニットテスト
├── integration/     # 統合テスト
└── e2e/             # E2Eテスト
```

詳細: [docs/architecture.md](docs/architecture.md)

## コーディング規約

### 技術スタック
- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui
- Supabase (PostgreSQL)
- Vitest + Playwright

詳細: [docs/tech-stack.md](docs/tech-stack.md)

### スタイルガイド

- **Server Components優先**: データフェッチはServer Componentsで行う
- **Server Actions**: フォーム送信・データ変更は `app/actions/` のServer Actionsを使用
- **バリデーション**: Zodスキーマを `lib/validations/` に定義
- **パスエイリアス**: `@/` で `src/` を参照
- **コミットメッセージ**: 日本語で記述、プレフィックス使用 (feat:, fix:, docs:, test:, chore:)

### 金額の扱い

- **収入**: 正の整数で保存
- **支出・繰越**: 負の整数で保存（入力時は正の値、保存時に負に変換）

### 担当者 (Person)

```typescript
type Person = 'husband' | 'wife'
```

## データベース

3つのテーブル: `incomes`, `expenses`, `carryovers`

詳細: [docs/database.md](docs/database.md)

## テスト

- ユニットテスト: `tests/unit/` - 計算ロジック、バリデーション
- 統合テスト: `tests/integration/` - Server Actions
- E2Eテスト: `tests/e2e/` - ユーザーフロー

詳細: [docs/testing.md](docs/testing.md)

## ドキュメント一覧

| ファイル | 内容 |
|---------|------|
| [docs/README.md](docs/README.md) | プロジェクト概要 |
| [docs/architecture.md](docs/architecture.md) | アーキテクチャ・構造 |
| [docs/tech-stack.md](docs/tech-stack.md) | 技術スタック |
| [docs/components.md](docs/components.md) | コンポーネント詳細 |
| [docs/features.md](docs/features.md) | 主要機能 |
| [docs/database.md](docs/database.md) | データベース設計 |
| [docs/testing.md](docs/testing.md) | テスト構成 |
| [docs/configuration.md](docs/configuration.md) | 設定ファイル |
