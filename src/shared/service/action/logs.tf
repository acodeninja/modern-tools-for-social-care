resource "aws_cloudwatch_log_group" "action" {
  name              = "/aws/lambda/${aws_lambda_function.action.function_name}"
  retention_in_days = var.log_retention_days
}
