output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "alb_dns_name" {
  description = "ALB の DNS 名 (バックエンド API エンドポイント)"
  value       = aws_lb.main.dns_name
}

output "cloudfront_domain_name" {
  description = "CloudFront ドメイン名 (フロントエンドアクセス URL)"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "cloudfront_distribution_id" {
  description = "CloudFront ディストリビューション ID"
  value       = aws_cloudfront_distribution.frontend.id
}

output "ecr_repository_url" {
  description = "ECR リポジトリ URI (docker push に使用)"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecs_cluster_name" {
  description = "ECS クラスター名"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "ECS サービス名"
  value       = aws_ecs_service.backend.name
}

output "rds_endpoint" {
  description = "RDS エンドポイント"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}

output "s3_frontend_bucket" {
  description = "フロントエンド用 S3 バケット名"
  value       = aws_s3_bucket.frontend.bucket
}

output "s3_storage_bucket" {
  description = "Active Storage 用 S3 バケット名"
  value       = aws_s3_bucket.storage.bucket
}
