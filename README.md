# NextJS in CloudFront in few lines

```sh
npm i -D next-aws-serverless
# Build your app in "standalone" mode
next build
# Run the CLI to bundle lambda and static assets in .next-serverless
next-aws-serverless
# Deploy
terraform -chdir=.next-serverless/terraform apply
```
