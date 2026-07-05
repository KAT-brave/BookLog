# インフラ構成

## AWS 構成図

```
                              インターネット
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
              [フロントエンド]   [バックエンド API]
                    │               │
                    ▼               ▼
             [CloudFront]      [Route 53]
                    │          (カスタムドメイン時)
                    │               │
                    ▼               ▼
              [S3 Bucket]       [ALB]
            (React ビルド)   (HTTPS/80→443)
                                    │
                               [ECS Fargate]
                             (Rails API コンテナ)
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
               [RDS]           [SSM]          [S3 Bucket]
          (PostgreSQL 16)   (シークレット)  (Active Storage)
          プライベートサブネット          書籍表紙画像
```

## リソース一覧

### ネットワーク

| リソース | 設定 |
|---------|------|
| VPC | CIDR: `10.0.0.0/16` |
| パブリックサブネット | `10.0.1.0/24`（ap-northeast-1a）, `10.0.2.0/24`（ap-northeast-1c） |
| プライベートサブネット | `10.0.11.0/24`（ap-northeast-1a）, `10.0.12.0/24`（ap-northeast-1c） |
| Internet Gateway | パブリックサブネットにアタッチ |
| NAT Gateway | パブリックサブネットに配置（ECS → 外部通信用） |

### セキュリティグループ

| SG 名 | 適用先 | インバウンド |
|-------|-------|------------|
| alb-sg | ALB | 0.0.0.0/0:443, 0.0.0.0/0:80 |
| ecs-sg | ECS Fargate | alb-sg:3000 |
| rds-sg | RDS | ecs-sg:5432 |

### コンテナ（ECS Fargate）

| 項目 | 設定 |
|-----|------|
| クラスター名 | `booklog-production-cluster` |
| タスク CPU / メモリ | 256 CPU / 512 MiB |
| コンテナポート | 3000 |
| 起動コマンド | `./bin/rails server -b 0.0.0.0 -p 3000` |
| ログ | CloudWatch Logs（`/ecs/booklog-production/backend`、30 日保持） |
| ヘルスチェック | `curl -f http://localhost:3000/up` |
| デプロイ | Circuit Breaker 有効（失敗時ロールバック） |

### データベース（RDS）

| 項目 | 設定 |
|-----|------|
| エンジン | PostgreSQL 16 |
| インスタンスクラス | db.t3.micro |
| マルチ AZ | なし（学習用途） |
| 自動バックアップ | 7 日間保持 |
| 暗号化 | 有効 |
| 配置 | プライベートサブネット |

### フロントエンド配信

| リソース | 設定 |
|---------|------|
| S3 Bucket | パブリックアクセス禁止・CloudFront OAC でアクセス |
| CloudFront | HTTPS のみ・SPA 対応（403/404 → index.html） |
| キャッシュ | デフォルト 86400 秒 |
| Price Class | PriceClass_200（北米・欧州・アジア） |

### 画像ストレージ（Active Storage）

| リソース | 設定 |
|---------|------|
| S3 Bucket | プライベート・Rails のみアクセス |
| IAM ロール | ECS タスクロールから直接 S3 にアクセス（アクセスキー不要） |

### シークレット管理

| パラメータ名 | 用途 |
|------------|------|
| `/booklog-production/database_url` | RDS 接続文字列（SecureString） |
| `/booklog-production/rails_master_key` | Rails 暗号化キー（SecureString） |

ECS タスク定義の `secrets` セクションで参照し、コンテナ起動時に環境変数として注入されます。

## CI/CD フロー

```
git push (GitHub)
    │
    ├── backend/** 変更 → backend.yml
    │       ├── RSpec（PostgreSQL サービスコンテナ付き）
    │       └── RuboCop
    │
    ├── frontend/** 変更 → frontend.yml
    │       ├── Vitest ユニットテスト
    │       ├── TypeScript 型チェック
    │       └── Vite ビルド
    │
    └── e2e.yml（手動 or 全変更時）
            └── Playwright E2E（Rails + Vite 両方起動）
                    └── playwright-report をアーティファクト保存
```

## Terraform 管理ファイル

```
terraform/
├── main.tf              # プロバイダー・ローカル変数
├── variables.tf         # 変数定義
├── terraform.tfvars     # 実際の値（.gitignore で除外）
├── terraform.tfvars.example  # テンプレート（コミット済み）
├── vpc.tf               # VPC・サブネット・IGW・NAT
├── security_groups.tf   # セキュリティグループ
├── rds.tf               # RDS PostgreSQL
├── ecr.tf               # ECR リポジトリ
├── iam.tf               # ECS 実行ロール・タスクロール
├── alb.tf               # ALB・ターゲットグループ・リスナー
├── ecs.tf               # ECS クラスター・タスク定義・サービス・SSM
├── s3.tf                # フロントエンド用・ストレージ用 S3
├── cloudfront.tf        # CloudFront ディストリビューション
└── outputs.tf           # ALB DNS・CloudFront URL・ECR URI 等
```

## デプロイ手順（初回）

```bash
cd terraform

# 1. tfvars を作成
cp terraform.tfvars.example terraform.tfvars
# terraform.tfvars を編集して実際の値を入力

# 2. Terraform 初期化
terraform init

# 3. 差分確認
terraform plan

# 4. インフラ構築
terraform apply

# 5. Docker イメージをビルドして ECR にプッシュ
aws ecr get-login-password --region ap-northeast-1 | \
  docker login --username AWS --password-stdin <ECR_URI>
docker build -t booklog-backend ./backend
docker tag booklog-backend:latest <ECR_URI>:latest
docker push <ECR_URI>:latest

# 6. ECS サービスを更新して新しいイメージをデプロイ
aws ecs update-service \
  --cluster booklog-production-cluster \
  --service booklog-production-backend \
  --force-new-deployment

# 7. フロントエンドをビルドして S3 にデプロイ
cd frontend
npm run build
aws s3 sync dist/ s3://<S3_FRONTEND_BUCKET>/

# 8. CloudFront キャッシュを無効化
aws cloudfront create-invalidation \
  --distribution-id <DISTRIBUTION_ID> \
  --paths "/*"
```
