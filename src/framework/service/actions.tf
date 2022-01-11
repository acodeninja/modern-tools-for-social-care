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
  policy                = each.value.policy
  api_id                = aws_apigatewayv2_api.api.id
  api_route             = each.value.route
  api_execution_arn     = aws_apigatewayv2_api.api.execution_arn
  environment_variables = each.value.environment_variables
}
