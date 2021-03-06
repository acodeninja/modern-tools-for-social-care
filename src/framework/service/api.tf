resource "aws_apigatewayv2_api" "api" {
  name          = "${var.system}-${var.environment}-${var.name}"
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins = var.config.api.cors.origins
  }
}

resource "aws_apigatewayv2_stage" "api" {
  api_id        = aws_apigatewayv2_api.api.id
  name          = var.environment
  deployment_id = aws_apigatewayv2_deployment.api.id
  stage_variables = {
    MANIFEST_BUCKET = "${var.system}-${var.environment}-manifests"
    MANIFEST_KEY    = "services/${var.name}.json"
    SERVICE         = var.name
    SYSTEM          = var.system
  }

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.action.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      routeKey       = "$context.routeKey"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
    })
  }
}

resource "aws_apigatewayv2_deployment" "api" {
  api_id      = aws_apigatewayv2_api.api.id
  description = "Latest ${var.name} (${var.environment}) deployment"

  lifecycle {
    create_before_destroy = true
  }

  triggers = {
    config-changed = sha1(jsonencode(var.config))
    actions-deploy = sha1(jsonencode([for action in module.actions : action.api-config]))
  }

  depends_on = [module.actions]
}

resource "aws_cloudwatch_log_group" "action" {
  name              = "/aws/api/${var.system}-${var.environment}-${var.name}"
  retention_in_days = 14
}

resource "aws_apigatewayv2_api_mapping" "service" {
  api_id      = aws_apigatewayv2_api.api.id
  domain_name = aws_apigatewayv2_domain_name.service.id
  stage       = aws_apigatewayv2_stage.api.id
}
