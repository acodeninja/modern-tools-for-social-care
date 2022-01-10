resource "aws_s3_bucket" "manifests" {
  bucket = "${var.system}-${var.environment}-manifests"
  acl    = "private"
}

resource "aws_s3_bucket_public_access_block" "manifests" {
  bucket            = aws_s3_bucket.manifests.bucket
  block_public_acls = true
}

resource "aws_s3_bucket_object" "manifest" {
  bucket         = aws_s3_bucket.manifests.bucket
  key            = "account.json"
  content_type   = "application/json"
  content_base64 = base64encode(local.account-manifest)
}

locals {
  account-manifest = jsonencode({
    deploy = {
      bucket = aws_s3_bucket.deployments.bucket
    }
  })
}
