resource "aws_lambda_function" "action" {
  function_name     = "${var.system}-${var.environment}-${var.service}-action-${var.action}"
  role              = aws_iam_role.action_role.arn
  handler           = var.handler
  runtime           = var.runtime
  publish           = true
  s3_bucket         = local.manifest.deploy.bucket
  s3_key            = "${var.service}/actions/${var.action}.zip"
  s3_object_version = aws_s3_bucket_object.artefact.version_id

  environment {
    variables = var.environment_variables
  }
}

resource "aws_lambda_permission" "lambda_permission" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.action.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = local.api_execution_full
}

locals {
  api_execution_full = "${var.api_execution_arn}/${var.environment}/${replace(var.api_route, "/\\s\\S+$/", "")}/${replace(var.api_route, "/^([A-Z])+\\s\//", "")}"
}
