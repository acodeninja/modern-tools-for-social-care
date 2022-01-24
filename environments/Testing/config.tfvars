environment = "testing"
service-config-search = {
  aws_opensearch_instance_type         = "t3.small.elasticsearch"
  aws_opensearch_instance_count        = 1
  aws_opensearch_instance_volume_size  = 10
  aws_api_gateway_cors_allowed_origins = ["dev.hackney.gov.uk"]
}
