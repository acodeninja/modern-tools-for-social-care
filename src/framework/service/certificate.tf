resource "aws_acm_certificate" "service" {
  domain_name               = local.domains.web
  subject_alternative_names = [local.domains.api]
  validation_method         = "DNS"
}

resource "aws_route53_record" "verify" {
  for_each = {
  for option in aws_acm_certificate.service.domain_validation_options : option.domain_name => {
    name   = option.resource_record_name
    record = option.resource_record_value
    type   = option.resource_record_type
  }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.root.zone_id
}
