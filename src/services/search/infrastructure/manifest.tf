data "aws_s3_bucket_object" "account_manifest" {
  bucket = "${var.system}-${var.environment}-manifests"
  key    = "account/services/search.json"
}

locals {
  account-manifest = jsondecode(data.aws_s3_bucket_object.account_manifest.body)
}
