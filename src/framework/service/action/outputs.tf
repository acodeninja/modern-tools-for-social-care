output "api-config" {
  value = {
    route       = aws_apigatewayv2_route.action
    integration = aws_apigatewayv2_integration.action
    authorizer  = aws_apigatewayv2_authorizer.authorizer
  }
}
