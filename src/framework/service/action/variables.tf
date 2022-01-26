variable "action" {
  description = "The name of the action"
  type        = string
}

variable "service" {
  description = "The name of the service this action is a part of"
  type        = string
}

variable "build_directory" {
  description = "The directory containing artefact files to bundle for this action"
  type        = string
}

variable "runtime" {
  description = "The language runtime to use when executing"
}

variable "handler" {
  description = "The handler path for this action"
}

variable "policy" {
  description = "The JSON policy document that should be applied to this function"
}

variable "authentication" {
  description = "If the account lambda authorizer should be used for this action."
  default     = null
  type        = object({
    required_groups = optional(set(string))
  })
}

variable "environment_variables" {
  description = "A map of environment variables for the action"
  type        = map(string)
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
