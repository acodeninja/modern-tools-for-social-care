terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }
  experiments      = [module_variable_optional_attrs]
  required_version = "1.1.2"
}
