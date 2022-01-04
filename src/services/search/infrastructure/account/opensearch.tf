resource "aws_elasticsearch_domain" "search" {
  domain_name           = local.service-name
  elasticsearch_version = "OpenSearch_1.0"

  cluster_config {
    instance_type          = var.aws_opensearch_instance_type
    instance_count         = var.aws_opensearch_instance_count
    zone_awareness_enabled = false
  }

  ebs_options {
    ebs_enabled = true
    volume_size = var.aws_opensearch_instance_volume_size
  }

  domain_endpoint_options {
    enforce_https = true
  }

  tags = {
    Domain = local.domain-name
  }
}
