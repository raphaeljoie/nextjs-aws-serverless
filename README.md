# NextJS in CloudFront in few lines


## Usage
```sh
# Install next-aws-serverless
npm i -D next-aws-serverless
# Build your app in "standalone" mode
next build
# Run the CLI to bundle lambda and static assets in .next-serverless
next-aws-serverless
# Customize the deployment
mkdir deployment && nano deployment/main.tf
```
```tf
// Example of deployment/main.tf
module "this" {
  source = "../.next-serverless/terraform"

  app_name = "blabetiblou"
}

provider "aws" {
  # !!! MANDATORY !!!
  # CloudFront resources always deploys from US
  region = "us-east-1"
}
```
```shell
# Execute
terraform -chdir=deployment init
terraform -chdir=deployment apply
```

## TODO
- [ ] documentation file content_type in S3
- [ ] doc https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-edge-permissions.html
