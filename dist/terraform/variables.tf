variable "app_name" {
  type        = string
  description = "Name of the application, used for building default names for resources"
}

variable "lambda_name" {
  type        = string
  default     = null
  description = "Name of the lambda function. Default is nextjs-$${var.app_name}"
}

variable "bucket_name" {
  type        = string
  default     = null
  description = "Name of the bucket for static assets. Default is nextjs-$${var.app_name}"
}

