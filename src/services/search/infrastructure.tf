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

variable "aws_opensearch_instance_type" {
  description = "The instance class of the opensearch domain."
  type        = string
}

variable "aws_opensearch_instance_count" {
  description = "The number of instances for the opensearch domain."
  type        = number
}

variable "aws_opensearch_instance_volume_size" {
  description = "The number GB of storage available on each node."
  type        = number
}

locals {
  service-name = "${var.system}-${var.environment}-search"
  domain-name  = "${upper(var.system)}_${upper(var.environment)}"
}

resource "aws_elasticsearch_domain" "search" {
  domain_name           = local.domain-name
  elasticsearch_version = "OpenSearch_1.0"

  cluster_config {
    instance_type          = var.aws_opensearch_instance_type
    instance_count         = var.aws_opensearch_instance_count
    zone_awareness_enabled = false
  }

  ebs_options {
    ebs_enabled = true
    volume_size = var.aws_opensearch_instance_volume_size
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
      "es:ESHttpGet"
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
        build_directory = "${path.root}/build/actions/search"
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
        build_directory = "${path.root}/build/actions/update"
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
