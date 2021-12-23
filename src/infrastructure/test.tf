data "aws_regions" "test" {}

output "caller_region" {
  value = data.aws_regions.test.all_regions
}

resource "aws_instance" "test" {
  instance_type = "something"
}
