data "aws_route53_zone" "root" {
  name = var.root-domain
}

data "aws_acm_certificate" "root" {
  domain = var.root-domain
}

resource "aws_apigatewayv2_domain_name" "service" {
  domain_name = "api.${var.name}.${var.root-domain}"

  domain_name_configuration {
    certificate_arn = data.aws_acm_certificate.root.arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }
}

resource "aws_route53_record" "service" {
  name    = aws_apigatewayv2_domain_name.service.domain_name
  type    = "A"
  zone_id = data.aws_route53_zone.root.zone_id

  alias {
    name                   = aws_apigatewayv2_domain_name.service.domain_name_configuration[0].target_domain_name
    zone_id                = aws_apigatewayv2_domain_name.service.domain_name_configuration[0].hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_apigatewayv2_api_mapping" "service" {
  api_id      = aws_apigatewayv2_api.api.id
  domain_name = aws_apigatewayv2_domain_name.service.id
  stage       = aws_apigatewayv2_stage.api.id
}
