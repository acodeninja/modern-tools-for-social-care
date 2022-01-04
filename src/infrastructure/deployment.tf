resource "aws_s3_bucket" "deployments" {
  bucket = "${var.system}-${var.environment}-deployment"
  acl    = "private"
}

resource "aws_s3_bucket_public_access_block" "deployments" {
  bucket            = aws_s3_bucket.manifests.bucket
  block_public_acls = true
}
