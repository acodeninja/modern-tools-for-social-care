resource "aws_apigatewayv2_route" "action" {
  api_id    = var.api_id
  route_key = var.api_route
}

resource "aws_apigatewayv2_integration" "action" {
  api_id                    = var.api_id
  integration_type          = "AWS_PROXY"
  connection_type           = "INTERNET"
  description               = "Search service API"
  integration_method        = "POST"
  integration_uri           = aws_lambda_function.action.invoke_arn
  passthrough_behavior      = "WHEN_NO_MATCH"
}
