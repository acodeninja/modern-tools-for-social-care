terraform {
  backend "s3" {}

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }

  required_version = "1.1.2"
}

variable "system" {
  description = "The name of the system this service is deployed to."
  type        = string

  validation {
    condition     = can(regex("^[a-z][0-9a-z\\-]+$", var.system))
    error_message = "The system value must be lower case alpha numeric with hyphen separators."
  }
}

variable "environment" {
  description = "The name of the system environment deployed to."
  type        = string

  validation {
    condition     = contains(["production", "staging", "testing"], var.environment)
    error_message = "The environment value must be one of 'production', 'staging', 'testing'."
  }
}

variable "service-config-search" {
  description = "The configuration object for this service."
  type = object({
    aws_opensearch_instance_type        = string
    aws_opensearch_instance_count       = number
    aws_opensearch_instance_volume_size = number
  })
}

locals {
  service-name = "${var.system}-${var.environment}-search"
  domain-name  = "${upper(var.system)}_${upper(var.environment)}"
}

resource "aws_elasticsearch_domain" "search" {
  domain_name           = local.service-name
  elasticsearch_version = "OpenSearch_1.1"

  cluster_config {
    instance_type          = var.service-config-search.aws_opensearch_instance_type
    instance_count         = var.service-config-search.aws_opensearch_instance_count
    zone_awareness_enabled = false
  }

  ebs_options {
    ebs_enabled = true
    volume_size = var.service-config-search.aws_opensearch_instance_volume_size
  }

  domain_endpoint_options {
    enforce_https       = true
    tls_security_policy = "Policy-Min-TLS-1-2-2019-07"
  }

  tags = {
    Domain = local.domain-name
  }

  lifecycle {
    prevent_destroy = true
  }
}

data "aws_iam_policy_document" "put_to_open_search" {
  statement {
    sid    = "AllowPuttingToOpenSearch"
    effect = "Allow"
    actions = [
      "es:ESHttpPost"
    ]
    resources = [
      aws_elasticsearch_domain.search.arn,
      "${aws_elasticsearch_domain.search.arn}/*",
    ]
  }
}

data "aws_iam_policy_document" "get_to_open_search" {
  statement {
    sid    = "AllowGettingFromOpenSearch"
    effect = "Allow"
    actions = [
      "es:ESHttpPost"
    ]
    resources = [
      aws_elasticsearch_domain.search.arn,
      "${aws_elasticsearch_domain.search.arn}/*",
    ]
  }
}

module "service" {
  source      = "../../framework/service"
  name        = "search"
  system      = var.system
  environment = var.environment
  config = {
    actions = [
      {
        name            = "search"
        handler         = "search.LambdaHandler"
        build_directory = "build/actions/search"
        route           = "GET /"
        policy          = data.aws_iam_policy_document.get_to_open_search.json
        environment_variables = {
          ENVIRONMENT             = var.environment
          SYSTEM                  = var.system
          AWS_OPENSEARCH_ENDPOINT = aws_elasticsearch_domain.search.endpoint
        }
      },
      {
        name            = "update"
        handler         = "update.LambdaHandler"
        build_directory = "build/actions/update"
        route           = "PUT /"
        policy          = data.aws_iam_policy_document.put_to_open_search.json
        environment_variables = {
          ENVIRONMENT             = var.environment
          SYSTEM                  = var.system
          AWS_OPENSEARCH_ENDPOINT = aws_elasticsearch_domain.search.endpoint
        }
      },
    ]
  }
}
