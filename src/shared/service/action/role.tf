data "aws_iam_policy_document" "assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      identifiers = ["lambda.amazonaws.com"]
      type        = "Service"
    }
  }
}

resource "aws_iam_role" "action_role" {
  name               = "${var.system}-${var.environment}-${var.service}-actions-${var.action}-role"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

data "aws_iam_policy_document" "action_logging" {
  source_policy_documents = [var.policy]

  statement {
    sid = "AllowLoggingToCloudwatch"
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = [aws_cloudwatch_log_group.action.arn]
  }
}

resource "aws_iam_policy" "lambda" {
  name        = "${var.system}-${var.environment}-${var.service}-actions-${var.action}-policy"
  path        = "/"
  policy      = data.aws_iam_policy_document.action_logging.json
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.action_role.name
  policy_arn = aws_iam_policy.lambda.arn
}

