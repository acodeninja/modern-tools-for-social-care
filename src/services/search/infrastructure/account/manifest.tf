resource "aws_s3_bucket_object" "manifest" {
  bucket       = var.manifests_bucket
  key          = "services/search.json"
  content_type = "application/json"
  content      = jsonencode({
    opensearch = {
      endpoint = aws_elasticsearch_domain.search.endpoint
      arn      = aws_elasticsearch_domain.search.arn
    }
  })
}
