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
  version = "0.1.2"

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

locals {
  mime_types = {
    ".aac": "audio/aac"
    ".abw": "application/x-abiword"
    ".arc": "application/x-freearc"
    ".avif": "image/avif"
    ".avi": "video/x-msvideo"
    ".azw": "application/vnd.amazon.ebook"
    ".bin": "application/octet-stream"
    ".bmp": "image/bmp"
    ".bz": "application/x-bzip"
    ".bz2": "application/x-bzip2"
    ".cda": "application/x-cdf"
    ".csh": "application/x-csh"
    ".css": "text/css"
    ".csv": "text/csv"
    ".doc": "application/msword"
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ".eot": "application/vnd.ms-fontobject"
    ".epub": "application/epub+zip"
    ".gz": "application/gzip"
    ".gif": "image/gif"
    ".htm": "text/html"
    ".html": "text/html"
    ".ico": "image/vnd.microsoft.icon"
    ".ics": "text/calendar"
    ".jar": "application/java-archive"
    ".jpeg": "image/jpeg"
    ".jpg": "image/jpeg"
    ".js": "text/javascript"
    ".json": "application/json"
    ".jsonld": "application/ld+json"
    ".mid, .midi": "audio/midi, audio/x-midi"
    ".mjs": "text/javascript"
    ".mp3": "audio/mpeg"
    ".mp4": "video/mp4"
    ".mpeg": "video/mpeg"
    ".mpkg": "application/vnd.apple.installer+xml"
    ".odp": "application/vnd.oasis.opendocument.presentation"
    ".ods": "application/vnd.oasis.opendocument.spreadsheet"
    ".odt": "application/vnd.oasis.opendocument.text"
    ".oga": "audio/ogg"
    ".ogv": "video/ogg"
    ".ogx": "application/ogg"
    ".opus": "audio/opus"
    ".otf": "font/otf"
    ".png": "image/png"
    ".pdf": "application/pdf"
    ".php": "application/x-httpd-php"
    ".ppt": "application/vnd.ms-powerpoint"
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ".rar": "application/vnd.rar"
    ".rtf": "application/rtf"
    ".sh": "application/x-sh"
    ".svg": "image/svg+xml"
    ".tar": "application/x-tar"
    ".tif": "image/tiff"
    ".tiff": "image/tiff"
    ".ts": "video/mp2t"
    ".ttf": "font/ttf"
    ".txt": "text/plain"
    ".vsd": "application/vnd.visio"
    ".wav": "audio/wav"
    ".weba": "audio/webm"
    ".webm": "video/webm"
    ".webp": "image/webp"
    ".woff": "font/woff"
    ".woff2": "font/woff2"
    ".xhtml": "application/xhtml+xml"
    ".xls": "application/vnd.ms-excel"
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ".xml": "application/xml is recommended as of RFC 7303 (section 4.1), but text/xml is still used sometimes. You can assign a specific MIME type to a file with .xml extension depending on how its contents are meant to be interpreted. For instance, an Atom feed is application/atom+xml, but application/xml serves as a valid default."
    ".xul": "application/vnd.mozilla.xul+xml"
    ".zip": "application/zip"
    ".3gp": "video/3gpp; audio/3gpp if it doesn't contain video"
    ".3g2": "video/3gpp2; audio/3gpp2 if it doesn't contain video"
    ".7z": "application/x-7z-compressed"
  }
}

resource "aws_s3_object" "dist" {
  for_each = fileset("${path.module}/../s3", "**/*")

  bucket = module.webapp.static_bucket
  force_destroy = true
  key    = each.value
  source = "${path.module}/../s3/${each.value}"
  # etag makes the file update when it changes; see https://stackoverflow.com/questions/56107258/terraform-upload-file-to-s3-on-every-apply
  etag   = filemd5("${path.module}/../s3/${each.value}")
  content_type = lookup(local.mime_types, regex("\\.[^.]+$", "${each.value}"), null)
}
