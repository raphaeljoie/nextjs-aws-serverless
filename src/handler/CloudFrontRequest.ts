import { CloudFrontHeaders } from './CloudFrontHeaders';

export type CloudFrontRequest = {
  uri: string
  method: string
  querystring: string
  headers: CloudFrontHeaders
  body: undefined | {
    data: undefined | any
    encoding: string | undefined
  }
};
