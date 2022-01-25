module "actions" {
  for_each              = {for action in var.config.actions : action.name => action}
  source                = "./action"
  system                = var.system
  environment           = var.environment
  service               = "search"
  action                = each.value.name
  handler               = each.value.handler
  build_directory       = each.value.build_directory
  runtime               = "nodejs14.x"
  policy                = each.value.policy
  api_id                = aws_apigatewayv2_api.api.id
  api_route             = each.value.route
  api_execution_arn     = aws_apigatewayv2_api.api.execution_arn
  environment_variables = each.value.environment_variables
  authentication        = each.value.authentication
}
