variable "aws_elasticsearch_instance_type" {
  description = "The instance class of the elasticsearch domain."
  type        = string
}

variable "aws_elasticsearch_instance_count" {
  description = "The number of instances for the elasticsearch domain."
  type        = number
}

variable "aws_elasticsearch_availability_zone_count" {
  description = "The number of availability zones for the elasticsearch domain."
  type        = number
}
