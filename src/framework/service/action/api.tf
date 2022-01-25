variable "api_id" {
  description = "The APIGateway ID to attach this action to"
  type        = string
}

variable "api_route" {
  description = "The route to attach this action to. Eg GET /"
  type        = string
}

variable "api_execution_arn" {
  description = "The execution arn of the api gateway."
}

resource "aws_apigatewayv2_route" "action" {
  api_id    = var.api_id
  route_key = var.api_route
  target    = "integrations/${aws_apigatewayv2_integration.action.id}"
}

resource "aws_apigatewayv2_integration" "action" {
  api_id               = var.api_id
  integration_type     = "AWS_PROXY"
  connection_type      = "INTERNET"
  description          = "${var.action} API"
  integration_method   = "POST"
  integration_uri      = aws_lambda_function.action.invoke_arn
  passthrough_behavior = "WHEN_NO_MATCH"
  request_parameters = {
    "cookies"    = "$request.header.Cookie"
  }
}
