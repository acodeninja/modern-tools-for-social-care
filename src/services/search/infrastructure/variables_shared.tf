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
    condition     = contains(["production", "staging", "integration"], var.environment)
    error_message = "The environment value must be one of 'production', 'staging', 'integration'."
  }
}

locals {
  service-name = "${var.system}-${var.environment}-search"
  domain-name  = "${upper(var.system)}_${upper(var.environment)}"
}
