resource "aws_apigatewayv2_api" "api" {
  name          = "${var.system}-${var.environment}-seach"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_stage" "api" {
  api_id        = aws_apigatewayv2_api.api.id
  name          = var.environment
  deployment_id = aws_apigatewayv2_deployment.api.id
}

resource "aws_apigatewayv2_deployment" "api" {
  api_id      = aws_apigatewayv2_api.api.id
  description = "Latest ${var.environment} deployment"

  lifecycle {
    create_before_destroy = true
  }
}
