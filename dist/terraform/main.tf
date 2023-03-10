module "lambda" {
  source  = "raphaeljoie/zip-lambda/aws"
  version = "0.1.2"

  lambda_name = coalesce(var.lambda_name, "nextjs-${var.app_name}")
  source_path = "${path.module}/../lambda"

  edge_permissions = true

  timeout = 10
}

module "webapp" {
  source  = "raphaeljoie/cloudfront-webapp/aws"
  version = "0.1.3"

  lambda_qualified_arn = module.lambda.lambda_qualified_arn

  s3_bucket_name = coalesce(var.bucket_name, "nextjs-${var.app_name}")
  create_s3_bucket = true

  #custom_domain_name = local.domain_name
  #acm_certificate_arn = aws_acm_certificate.certificate.arn

  paths = [
    {
      type = "static"
      path = "_next/static/*"
    }, {
      type = "dynamic"
      path = "api/*"
    }
  ]

  default_path = {
    type = "dynamic"
  }
}

module "s3-sync" {
  source  = "raphaeljoie/s3-sync/aws"
  version = "0.1.2"

  bucket = module.webapp.static_bucket
  create_bucket = false
  dir_path = "${path.module}/../s3"
}
