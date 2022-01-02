locals {
  manifest-content = base64encode(jsonencode({
    opensearch = {
      endpoint = aws_elasticsearch_domain.search.endpoint
      arn      = aws_elasticsearch_domain.search.arn
    }
  }))
}

resource "aws_s3_bucket_object" "manifest" {
  bucket         = var.manifests_bucket
  key            = "account/services/search.json"
  content_type   = "application/json"
  content_base64 = local.manifest-content
}
