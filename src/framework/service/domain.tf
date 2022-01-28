data "aws_route53_zone" "root" {
  name = var.root-domain
}

resource "aws_apigatewayv2_domain_name" "service" {
  domain_name = local.domains.api

  domain_name_configuration {
    certificate_arn = aws_acm_certificate.service.arn
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
