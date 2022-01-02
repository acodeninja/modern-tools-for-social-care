resource "aws_elasticsearch_domain" "search" {
  domain_name           = local.service-name
  elasticsearch_version = "1.0"

  cluster_config {
    instance_type  = var.aws_elasticsearch_instance_type
    instance_count = var.aws_elasticsearch_instance_count

    zone_awareness_config {
      availability_zone_count = var.aws_elasticsearch_availability_zone_count
    }
  }

  tags = {
    Domain = local.domain-name
  }
}
