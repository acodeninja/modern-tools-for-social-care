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
