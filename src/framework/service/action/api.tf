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

data "aws_s3_bucket_object" "service_manifest" {
  bucket = "${var.system}-${var.environment}-manifests"
  key    = "system.json"
}

locals {
  system-manifest = jsondecode(data.aws_s3_bucket_object.service_manifest.body)
}

resource "aws_apigatewayv2_authorizer" "example" {
  count                            = var.authentication ? 1 : 0
  api_id                           = var.api_id
  authorizer_type                  = "REQUEST"
  authorizer_uri                   = local.system-manifest.lambdaAuthorizer.invokeArn
  name                             = "${var.system}-${var.environment}-${var.action}-authorizer"
  authorizer_result_ttl_in_seconds = 0
}

resource "aws_apigatewayv2_integration" "action" {
  api_id               = var.api_id
  integration_type     = "AWS_PROXY"
  connection_type      = "INTERNET"
  description          = "${var.action} API"
  integration_method   = "POST"
  integration_uri      = aws_lambda_function.action.invoke_arn
  passthrough_behavior = "WHEN_NO_MATCH"
}
