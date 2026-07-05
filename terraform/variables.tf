variable "project" {
  description = "プロジェクト名"
  type        = string
  default     = "booklog"
}

variable "env" {
  description = "環境名 (production / staging)"
  type        = string
  default     = "production"
}

variable "aws_region" {
  description = "AWS リージョン"
  type        = string
  default     = "ap-northeast-1"
}

# ネットワーク
variable "vpc_cidr" {
  description = "VPC の CIDR ブロック"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "パブリックサブネット CIDR (AZ ごと)"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "プライベートサブネット CIDR (AZ ごと)"
  type        = list(string)
  default     = ["10.0.11.0/24", "10.0.12.0/24"]
}

variable "availability_zones" {
  description = "使用するアベイラビリティゾーン"
  type        = list(string)
  default     = ["ap-northeast-1a", "ap-northeast-1c"]
}

# RDS
variable "db_name" {
  description = "データベース名"
  type        = string
  default     = "booklog_production"
}

variable "db_username" {
  description = "データベースユーザー名"
  type        = string
  default     = "booklog"
}

variable "db_password" {
  description = "データベースパスワード (Secrets Manager 推奨)"
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "RDS インスタンスクラス"
  type        = string
  default     = "db.t3.micro"
}

# ECS
variable "backend_image" {
  description = "バックエンドコンテナイメージ URI"
  type        = string
}

variable "backend_cpu" {
  description = "ECS タスクの CPU ユニット"
  type        = number
  default     = 256
}

variable "backend_memory" {
  description = "ECS タスクのメモリ (MiB)"
  type        = number
  default     = 512
}

variable "backend_desired_count" {
  description = "ECS サービスの希望タスク数"
  type        = number
  default     = 1
}

# アプリケーション設定
variable "rails_master_key" {
  description = "Rails RAILS_MASTER_KEY"
  type        = string
  sensitive   = true
}

variable "frontend_origin" {
  description = "フロントエンドの Origin URL (CORS 用)"
  type        = string
}

# S3
variable "s3_frontend_bucket_name" {
  description = "フロントエンド静的ファイル用 S3 バケット名"
  type        = string
}

variable "s3_storage_bucket_name" {
  description = "Active Storage 用 S3 バケット名"
  type        = string
}

# CloudFront
variable "cloudfront_price_class" {
  description = "CloudFront 価格クラス"
  type        = string
  default     = "PriceClass_200"
}

# ドメイン (任意)
variable "domain_name" {
  description = "カスタムドメイン名 (空の場合は CloudFront デフォルトドメインを使用)"
  type        = string
  default     = ""
}
