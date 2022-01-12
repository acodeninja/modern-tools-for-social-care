resource "aws_s3_bucket" "manifests" {
  bucket = "${var.system}-${var.environment}-manifests"
  acl    = "private"
}

resource "aws_s3_bucket_public_access_block" "manifests" {
  bucket            = aws_s3_bucket.manifests.bucket
  block_public_acls = true
}
