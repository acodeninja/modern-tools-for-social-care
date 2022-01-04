resource "aws_cloudwatch_log_group" "action" {
  name              = "/aws/lambda/${var.action}"
  retention_in_days = var.log_retention_days
}
