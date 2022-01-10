module "actions" {
  for_each              = var.config.application.actions
  source                = "./action"
  system                = var.system
  environment           = var.environment
  service               = "search"
  action                = "search"
  handler               = each.value.handler
  artefacts             = "${path.root}/../build/actions/search"
  runtime               = "nodejs14.x"
  policy                = data.aws_iam_policy_document.get_to_open_search.json
  api_id                = aws_apigatewayv2_api.api.id
  api_route             = each.value.route
  api_execution_arn     = aws_apigatewayv2_api.api.execution_arn
  environment_variables = {
    ENVIRONMENT             = var.environment
    SYSTEM                  = var.system
    AWS_OPENSEARCH_ENDPOINT = local.account-manifest.opensearch.endpoint
  }
}
