module "search_service" {
  source                              = "../services/search/infrastructure/account"
  environment                         = var.environment
  system                              = var.system
  manifests_bucket                    = aws_s3_bucket.manifests.bucket
  aws_opensearch_instance_type        = "t3.small.wrong"
  aws_opensearch_instance_count       = 1
  aws_opensearch_instance_volume_size = 10
}
