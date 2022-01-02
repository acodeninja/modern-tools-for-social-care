module "search_service" {
  source                           = "../services/search/infrastructure/account"
  environment                      = var.environment
  system                           = var.system
  aws_elasticsearch_instance_type  = "t3.small.search"
  aws_elasticsearch_instance_count = 1
}
