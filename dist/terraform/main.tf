module "lambda" {
  source  = "raphaeljoie/zip-lambda/aws"
  version = "0.1.1"

  lambda_name = coalesce(var.lambda_name, "nextjs-${var.app_name}")
  source_path = "${path.module}/../lambda"
  timeout = 10
}

module "webapp" {
  source  = "raphaeljoie/cloudfront-webapp/aws"
  version = "0.1.1"

  lambda_qualified_arn = module.lambda.lambda_qualified_arn

  s3_bucket_name = coalesce(var.bucket_name, "nextjs-${var.app_name}")
  create_s3_bucket = true

  #custom_domain_name = local.domain_name
  #acm_certificate_arn = aws_acm_certificate.certificate.arn

  paths = [
    {
      type = "static"
      path = "static/*"
    }, {
      type = "static"
      path = "_next/static/*"
    }, {
      type = "static"
      path = "public/*"
    }, {
      type = "dynamic"
      path = "api/*"
    }
  ]

  default_path = {
    type = "dynamic"
  }
}

resource "aws_s3_object" "dist" {
  for_each = fileset("${path.module}/../static/static", "**/*")

  bucket = module.webapp.static_bucket
  force_destroy = true
  key    = "_next/static/${each.value}"
  source = "${path.module}/../static/static/${each.value}"
  # etag makes the file update when it changes; see https://stackoverflow.com/questions/56107258/terraform-upload-file-to-s3-on-every-apply
  etag   = filemd5("${path.module}/../static/static/${each.value}")
}
