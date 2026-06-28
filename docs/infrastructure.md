# インフラ構成

## 構成図

```
ユーザー
  │
  │ HTTPS
  ▼
[CloudFront]
  │ ap-northeast-1 (東京)
  │
  ├── /api/* ──────────────────────────────────────────────┐
  │                                                         │
  │ default（React SPA）                                   ▼
  ▼                                              [ALB（Application Load Balancer）]
[S3]                                                        │
  └── Frontend（React ビルド済み静的ファイル）             │
                                                            ▼
                                              [ECS Fargate（Rails API :3000）]
                                                        │
                                                        │ PostgreSQL (ポート5432)
                                                        ▼
                                              [RDS (PostgreSQL 16.x)]
                                                        └── booklog_production

  S3（画像ストレージ：レビュー写真・アイコン）
  ← presigned URL方式でフロントエンドから直接アップロード
```

---

## サービス構成詳細

| サービス | 内容 | 備考 |
|---------|------|------|
| CloudFront | CDN・フロントエンド配信 | デフォルトドメイン使用（独自ドメインなし） |
| S3（Frontend） | React SPA の静的ファイル配信 | OAC経由のみアクセス可（直接アクセス不可） |
| ALB | Application Load Balancer | ECS Fargate へのルーティング |
| ECS Fargate | Rails APIサーバー（ポート3000） | EC2不使用・コンテナ構成 |
| RDS | PostgreSQL 16.x / db.t4g.micro | プライベートサブネット内・Fargate からのみアクセス |
| S3（画像） | レビュー写真・アイコン画像の保存 | presigned URLで直接アップロード |

---

## ネットワーク構成

| 項目 | 設定 |
|-----|------|
| VPC | 専用VPC |
| CloudFront セキュリティ | HTTPS のみ |
| ALB セキュリティグループ | CloudFrontからのHTTPのみ許可 |
| ECS セキュリティグループ | ALBからのHTTP(3000)のみ許可 |
| RDS セキュリティグループ | ECSからのPostgreSQL(5432)接続のみ許可 |
| S3 バケットポリシー | 認証済みユーザーのみpresigned URLでアップロード・取得可能 |

---

## CloudFront ルーティング

| パスパターン | オリジン | キャッシュ |
|---|---|---|
| `/*`（デフォルト） | S3（Frontend） | 有効（TTL: 24h） |
| `/api/*` | ALB | 無効 |

- SPA対応：403/404 → `/index.html`（200）を返却
- S3へのアクセスはOAC経由のみ（直接アクセス不可）

---

## 画像アップロードフロー（S3 presigned URL方式）

```
クライアント(React)
  │ 1. アップロード用presigned URLをリクエスト
  ▼
Rails API
  │ 2. AWS SDK でS3 presigned URLを発行
  ▼
クライアント(React)
  │ 3. presigned URLに直接PUT（S3へ直接アップロード）
  ▼
S3
  │ 4. アップロード完了後、S3のURLをAPIに送信
  ▼
Rails API → RDS（URLをDBに保存）
```

---

## Terraform ディレクトリ構成

```
terraform/
├── main.tf               # プロバイダー設定
├── variables.tf          # 変数定義
├── terraform.tfvars      # 変数値（Git管理外）
├── outputs.tf            # 出力定義
├── vpc.tf                # VPC・サブネット・IGW・NAT
├── security_groups.tf    # セキュリティグループ
├── alb.tf                # ALB・ターゲットグループ・リスナー
├── ecr.tf                # ECRリポジトリ
├── ecs.tf                # ECSクラスター・タスク定義・サービス
├── rds.tf                # RDSインスタンス
├── s3.tf                 # S3バケット（フロントエンド・画像）
├── cloudfront.tf         # CloudFrontディストリビューション
└── iam.tf                # IAMロール・ポリシー
```

---

## コスト管理方針（確認時のみ起動）

NAT GatewayとALBは起動時間に応じて課金されるため、**確認時のみ起動・終了後は全リソース削除**の運用とする。

| 運用 | 月額目安 |
|---|---|
| 常時起動 | 約$70/月 |
| 1日2〜4時間 × 20日 | 約$5〜10/月 |

```bash
# 起動（確認・レビュー時）
cd terraform
terraform apply

# 終了後（必ず実行）
terraform destroy
```

---

## デプロイ手順

**バックエンド**

```bash
cd backend
docker build -t booklog-backend .
aws ecr get-login-password --region ap-northeast-1 | \
  docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.ap-northeast-1.amazonaws.com
docker tag booklog-backend:latest <ECR_REPOSITORY_URL>:latest
docker push <ECR_REPOSITORY_URL>:latest
aws ecs update-service --cluster booklog-cluster --service booklog-backend --force-new-deployment
```

**フロントエンド**

```bash
cd frontend
npm run build
aws s3 sync dist/ s3://booklog-frontend/ --delete
aws cloudfront create-invalidation --distribution-id <DISTRIBUTION_ID> --paths "/*"
```

---

## Terraform 出力値

| 出力 | 説明 |
|---|---|
| `cloudfront_domain_name` | アプリケーションのURL |
| `alb_dns_name` | ALB DNS（デバッグ用） |
| `rds_endpoint` | RDSエンドポイント |
| `ecr_repository_url` | ECRリポジトリURL |
| `frontend_bucket_name` | フロントエンドS3バケット名 |
