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
    actions-changed = sha1(jsonencode(var.config.actions))
  }

  depends_on = [module.actions]
}

resource "aws_cloudwatch_log_group" "action" {
  name              = "/aws/api/${var.system}-${var.environment}-${var.name}"
  retention_in_days = 14
}
