module "action-update" {
  source      = "../../../shared/service/action"
  system      = var.system
  environment = var.environment
  service     = "search"
  action      = "update"
  handler     = "update"
  artefacts   = "${path.root}/../build/actions/update"
  runtime     = "nodejs14.x"
  environment_variables = {
    ENVIRONMENT             = var.environment
    SYSTEM                  = var.system
    AWS_OPENSEARCH_ENDPOINT = local.account-manifest.opensearch.endpoint
    AWS_OPENSEARCH_ARN      = local.account-manifest.opensearch.arn
  }
}
