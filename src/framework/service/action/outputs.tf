output "api-config" {
  value = {
    route       = aws_apigatewayv2_route.action.id
    integration = aws_apigatewayv2_integration.action.id
    authorizer = [for auth in aws_apigatewayv2_authorizer.authorizer : {
      id      = auth.id
      version = local.system-manifest.lambdaAuthorizer.version
    }]
  }
}
