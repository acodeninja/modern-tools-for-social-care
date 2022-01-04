data "aws_iam_policy_document" "put_to_open_search" {
  statement {
    sid    = "AllowPuttingToOpenSearch"
    effect = "Allow"
    actions = [
      "es:ESHttpPost"
    ]
    resources = [
      local.account-manifest.opensearch.arn,
      "${local.account-manifest.opensearch.arn}/*",
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
  api_id      = aws_apigatewayv2_api.api.id
  api_route   = "PUT /"
  environment_variables = {
    ENVIRONMENT             = var.environment
    SYSTEM                  = var.system
    AWS_OPENSEARCH_ENDPOINT = local.account-manifest.opensearch.endpoint
  }
}

data "aws_iam_policy_document" "get_to_open_search" {
  statement {
    sid    = "AllowGettingFromOpenSearch"
    effect = "Allow"
    actions = [
      "es:ESHttpGet"
    ]
    resources = [
      local.account-manifest.opensearch.arn,
      "${local.account-manifest.opensearch.arn}/*",
    ]
  }
}

module "action-search" {
  source      = "../../../shared/service/action"
  system      = var.system
  environment = var.environment
  service     = "search"
  action      = "search"
  handler     = "search.LambdaHandler"
  artefacts   = "${path.root}/../build/actions/search"
  runtime     = "nodejs14.x"
  policy      = data.aws_iam_policy_document.get_to_open_search.json
  api_id      = aws_apigatewayv2_api.api.id
  api_route   = "GET /"
  environment_variables = {
    ENVIRONMENT             = var.environment
    SYSTEM                  = var.system
    AWS_OPENSEARCH_ENDPOINT = local.account-manifest.opensearch.endpoint
  }
}
