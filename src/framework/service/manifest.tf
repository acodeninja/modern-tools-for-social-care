locals {
  manifest-content = base64encode(jsonencode({
    actions = {
      for action in var.config.actions : action.name => {
        route          = action.route
        authentication = action.authentication
      }
    }
    events      = {}
    subscribers = {}
    views       = {}
  }))
}

resource "aws_s3_bucket_object" "manifest" {
  bucket         = "${var.system}-${var.environment}-manifests"
  key            = "services/${var.name}.json"
  content_type   = "application/json"
  content_base64 = local.manifest-content
}
