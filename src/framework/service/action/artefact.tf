data "archive_file" "action" {
  output_path = "${path.root}/dist/${var.service}/actions/${var.action}.zip"
  type        = "zip"
  source_dir  = var.artefacts
}

data "aws_s3_bucket_object" "account_manifest" {
  bucket = "${var.system}-${var.environment}-manifests"
  key    = "account.json"
}

locals {
  manifest = jsondecode(data.aws_s3_bucket_object.account_manifest.body)
}

resource "aws_s3_bucket_object" "artefact" {
  bucket       = local.manifest.deploy.bucket
  key          = "${var.service}/actions/${var.action}.zip"
  content_type = "application/zip"
  source       = data.archive_file.action.output_path
  source_hash  = data.archive_file.action.output_md5
}
