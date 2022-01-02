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

variable "manifests_bucket" {
  description = "The AWS bucket containing account service manifests"
  type        = string

  validation {
    condition     = can(regex("^[a-z][0-9a-z\\-]+$", var.manifests_bucket))
    error_message = "An S3 bucket name must be lower case alpha numeric with hyphen separators."
  }
}

locals {
  service-name = "${var.system}-${var.environment}-search"
  domain-name  = "${upper(var.system)}_${upper(var.environment)}"
}
