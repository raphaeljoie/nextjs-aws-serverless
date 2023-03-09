import { Buffer } from 'buffer';
import { CloudFrontHeaders } from './CloudFrontHeaders';

export type CloudFrontResponse = {
  bodyEncoding: string,
  body: Buffer | string,
  headers: CloudFrontHeaders,
  statusDescription: string,
  status: string,
};
