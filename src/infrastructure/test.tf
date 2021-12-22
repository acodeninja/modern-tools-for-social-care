data "aws_regions" "test" {}

output "caller_region" {
  value = data.aws_regions.test.all_regions
}
