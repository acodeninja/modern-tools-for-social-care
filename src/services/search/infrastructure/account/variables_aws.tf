variable "aws_elasticsearch_instance_type" {
  description = "The instance class of the elasticsearch domain."
  type        = string
}

variable "aws_elasticsearch_instance_count" {
  description = "The number of instances for the elasticsearch domain."
  type        = number
}

variable "aws_elasticsearch_instance_volume_size" {
  description = "The number GB of storage available on each node."
  type        = number
}
