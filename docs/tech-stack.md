# 技術スタック

## バックエンド

| 役割 | 技術 | バージョン（目安） | 選定理由 |
|------|------|-----------------|---------|
| 言語 | Ruby | 3.3 | 前プロジェクト（Java）との対比で学習目的に適している |
| フレームワーク | Ruby on Rails（APIモード） | 8.x | Ruby標準のWebフレームワーク・Convention over Configuration で開発効率が高い |
| 認証 | devise-jwt | 最新安定版 | deviseの認証基盤にJWTを組み合わせ・フロントとのステートレスな分離に適している |
| パスワード暗号化 | bcrypt（devise同梱） | devise同梱 | deviseと統合・安全なハッシュ化 |
| ORM | ActiveRecord | Rails同梱 | SQLを意識せずモデルでDB操作が可能・Railsの標準機能 |
| DBマイグレーション | Railsマイグレーション | Rails同梱 | Rubyの DSL でスキーマ管理・ロールバック可能 |
| テスト | RSpec / DatabaseCleaner | 最新安定版 | DBモック不使用・実DBを使ったリアルなテスト |
| 静的解析 | RuboCop | 最新安定版 | Rubyの標準的なコードスタイル統一 |
| パッケージ管理 | Bundler（Gemfile） | Rails同梱 | Rubyの標準的な依存関係管理 |

---

## フロントエンド

| 役割 | 技術 | バージョン（目安） | 選定理由 |
|------|------|-----------------|---------|
| フレームワーク | React | 19.x | コンポーネントベースのUI構築・学習リソースが豊富 |
| 言語 | TypeScript | 6.x | 型安全・補完が効くことでバグを事前に防げる |
| ビルドツール | Vite | 6.x | 高速なHMR・シンプルな設定 |
| 状態管理 | React Context API / useState | React同梱 | 外部ライブラリなしでログイン状態をアプリ全体で共有 |
| HTTPクライアント | Fetch API / Axios | - | APIリクエストの送受信 |
| ユニットテスト | Vitest / React Testing Library | 最新安定版 | Viteとの相性・軽量なテスト基盤 |

---

## データベース

| 役割 | 技術 | バージョン（目安） | 選定理由 |
|------|------|-----------------|---------|
| RDBMS | PostgreSQL | 16.x | 高機能・ILIKE検索対応・RDS対応 |

---

## E2Eテスト

| 役割 | 技術 | バージョン（目安） | 選定理由 |
|------|------|-----------------|---------|
| E2Eテスト | Playwright | 最新安定版 | TypeScriptで記述可能・クロスブラウザ対応 |

---

## インフラ・クラウド

| 役割 | 技術 | 備考 |
|------|------|------|
| クラウド | AWS | |
| フロントエンド配信 | CloudFront + S3 | CloudFrontのデフォルトドメイン使用（独自ドメインなし） |
| バックエンド | ECS Fargate | EC2不使用 |
| DB | RDS（PostgreSQL 16.x） | プライベートサブネット内に配置 |
| ロードバランサー | ALB（Application Load Balancer） | ECS Fargate前段 |
| 画像ストレージ | Amazon S3 | レビュー写真・アイコン画像の保存 |
| IaC | Terraform | インフラのコード管理 |

---

## CI/CD

| 役割 | 技術 | 備考 |
|------|------|------|
| CI | GitHub Actions | Frontend / Backend / E2E の3ワークフロー分離 |

---

## 開発環境

| 役割 | 技術 |
|------|------|
| コンテナ | Docker / Docker Compose |
| IDE | VSCode |
| バージョン管理 | Git / GitHub |
| ベースイメージ（バックエンド） | ruby:3.3 |
