data "archive_file" "action" {
  output_path = "${path.root}/dist/${var.service}/actions/${var.action}.zip"
  type        = "zip"
  source_dir  = "${path.root}/${var.build_directory}"
}

resource "aws_s3_bucket_object" "artefact" {
  bucket       = "${var.system}-${var.environment}-deployments"
  key          = "${var.service}/actions/${var.action}.zip"
  content_type = "application/zip"
  source       = data.archive_file.action.output_path
  source_hash  = data.archive_file.action.output_md5
}
