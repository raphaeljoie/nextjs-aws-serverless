import { CloudFrontRequest } from './CloudFrontRequest';
import { CloudFrontHeaders } from './CloudFrontHeaders';

export type CloudFrontEvent = {
  request: CloudFrontRequest,
  response: {
    headers: CloudFrontHeaders
  },
};
