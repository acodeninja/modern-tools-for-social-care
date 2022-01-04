resource "aws_cloudwatch_log_group" "action" {
  name              = "/aws/lambda/${var.action}"
  retention_in_days = var.log_retention_days
}

data "aws_iam_policy_document" "action_logging" {
  statement {
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = [aws_cloudwatch_log_group.action.arn]
  }
}

resource "aws_iam_policy" "lambda_logging" {
  name        = "lambda_logging"
  path        = "/"
  description = "IAM policy for logging from a lambda"
  policy      = data.aws_iam_policy_document.action_logging.json
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.action_role.name
  policy_arn = aws_iam_policy.lambda_logging.arn
}
