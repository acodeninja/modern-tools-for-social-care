resource "aws_cloudwatch_log_group" "action" {
  name              = "/aws/lambda/${var.system}-${var.environment}/${var.service}/action/${var.action}"
  retention_in_days = var.log_retention_days
}
