resource "aws_s3_bucket_object" "account_manifest" {
  bucket         = aws_s3_bucket.manifests.bucket
  key            = "system.json"
  content_type   = "application/json"
  content_base64 = base64encode(jsonencode(local.manifest))
}

locals {
  manifest = {
    lambdaAuthorizer = {
      invokeArn = aws_lambda_function.authorizer.invoke_arn
      roleArn   = aws_iam_role.authorizer_role.arn
    }
  }
}
