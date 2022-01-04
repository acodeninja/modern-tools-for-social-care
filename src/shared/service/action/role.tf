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
  name               = "${var.action}-role"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

