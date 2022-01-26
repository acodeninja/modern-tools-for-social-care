resource "aws_cloudwatch_log_group" "authorizer" {
  name              = "/aws/lambda/${var.system}-${var.environment}-authorizer"
  retention_in_days = 14
}

data "aws_iam_policy_document" "authorizer_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      identifiers = ["lambda.amazonaws.com"]
      type        = "Service"
    }
  }
}

resource "aws_iam_role" "authorizer_role" {
  name               = "${var.system}-${var.environment}-authorizer-role"
  assume_role_policy = data.aws_iam_policy_document.authorizer_assume_role.json
}

data "aws_iam_policy_document" "authorizer_policy" {
  statement {
    sid    = "AllowLoggingToCloudwatch"
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = [
      aws_cloudwatch_log_group.authorizer.arn,
      "${aws_cloudwatch_log_group.authorizer.arn}:*",
    ]
  }

  statement {
    sid       = "AllowReadAccessToManifestsS3Bucket"
    effect    = "Allow"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.manifests.arn}/*"]
  }
}

resource "aws_iam_policy" "lambda" {
  name   = "${var.system}-${var.environment}-authorizer-policy"
  path   = "/"
  policy = data.aws_iam_policy_document.authorizer_policy.json
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.authorizer_role.name
  policy_arn = aws_iam_policy.lambda.arn
}

resource "aws_lambda_function" "authorizer" {
  function_name     = "${var.system}-${var.environment}-authorizer"
  role              = aws_iam_role.authorizer_role.arn
  handler           = "lambda-authorizer.handler"
  runtime           = "nodejs14.x"
  publish           = true
  s3_bucket         = aws_s3_bucket_object.artefact.bucket
  s3_key            = aws_s3_bucket_object.artefact.key
  s3_object_version = aws_s3_bucket_object.artefact.version_id

  depends_on = [aws_s3_bucket_object.artefact]
}

data "aws_caller_identity" "me" {}
data "aws_region" "current" {}

resource "aws_lambda_permission" "lambda_permission" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.authorizer.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${data.aws_region.current.name}:${data.aws_caller_identity.me.account_id}:*"
}

data "archive_file" "action" {
  output_path = "${path.root}/dist/lambda-authorizer.zip"
  type        = "zip"
  source_dir  = "${path.root}/build/lambda-authorizer"
}

resource "aws_s3_bucket_object" "artefact" {
  bucket       = aws_s3_bucket.deployments.bucket
  key          = "lambda-authorizer.zip"
  content_type = "application/zip"
  source       = data.archive_file.action.output_path
  source_hash  = data.archive_file.action.output_md5
}
