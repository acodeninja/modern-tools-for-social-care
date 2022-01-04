data "aws_iam_policy_document" "put_to_open_search" {
  statement {
    sid = "AllowPuttingToOpenSearch"
    effect = "Allow"
    actions = [
      "es:ESHttpPut"
    ]
    resources = [
      local.account-manifest.opensearch.arn,
      "${local.account-manifest.opensearch.arn}*",
    ]
  }
}

module "action-update" {
  source      = "../../../shared/service/action"
  system      = var.system
  environment = var.environment
  service     = "search"
  action      = "update"
  handler     = "update.LambdaHandler"
  artefacts   = "${path.root}/../build/actions/update"
  runtime     = "nodejs14.x"
  policy      = data.aws_iam_policy_document.put_to_open_search.json
  environment_variables = {
    ENVIRONMENT             = var.environment
    SYSTEM                  = var.system
    AWS_OPENSEARCH_ENDPOINT = local.account-manifest.opensearch.endpoint
  }
}
