variable "name" {
  description = "The name of the service"
  type        = string
}

variable "config" {
  description = "The service configuration"
  type = object({
    actions = list(object({
      name                  = string
      handler               = string
      build_directory       = string
      route                 = optional(string)
      policy                = optional(string)
      environment_variables = map(string)
    }))
  })
}

variable "log_retention_days" {
  description = "Number of days to retain logs for"
  default     = 14
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
