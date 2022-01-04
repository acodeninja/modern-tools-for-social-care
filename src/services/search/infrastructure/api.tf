resource "aws_apigatewayv2_api" "api" {
  name          = "${var.system}-${var.environment}-seach"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_stage" "api" {
  api_id = aws_apigatewayv2_api.api.id
  name   = var.environment
}
