resource "aws_lambda_function" "action" {
  function_name = var.action
  role          = aws_iam_role.action_role.arn
  handler       = var.handler
  runtime       = var.runtime
  publish       = true
  s3_bucket     = local.manifest.deploy.bucket
  s3_key        = "${var.service}/actions/${var.action}.zip"

  environment {
    variables = var.environment_variables
  }
}
