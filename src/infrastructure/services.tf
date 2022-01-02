module "search_service" {
  source                              = "../services/search/infrastructure/account"
  environment                         = var.environment
  system                              = var.system
  aws_opensearch_instance_type        = "t3.small.elasticsearch"
  aws_opensearch_instance_count       = 1
  aws_opensearch_instance_volume_size = 10
}
