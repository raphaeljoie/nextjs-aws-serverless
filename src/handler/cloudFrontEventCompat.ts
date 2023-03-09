// @ts-ignore
// eslint-disable-next-line import/no-named-default
import { default as Stream } from 'stream';
// @ts-ignore
// eslint-disable-next-line import/no-named-default
import { default as http, IncomingMessage } from 'http';
// @ts-ignore
// eslint-disable-next-line import/no-named-default
import { default as zlib } from 'zlib';
import { Buffer } from 'buffer';

import { CloudFrontResponse } from './CloudFrontResponse';
import { CloudFrontEvent } from './CloudFrontEvent';
import { CloudFrontHeaders } from './CloudFrontHeaders';

type Headers = { [key: string] : string | string[] };

type FakeReq = Stream.Readable & IncomingMessage & {
  connection: any
  getHeader: (header: string) => string | string[],
  headers: Headers
  rawHeaders: string[] | undefined
  getHeaders: () => Headers
};

type FakeRes = Stream & {
  finished: boolean
  headers: Headers
  writeHead: (status: string | number, newHeaders: Headers) => FakeRes
  write: (chunk: any) => void
  end: (chunk: any) => void
  statusCode: number
  setHeader: (name: string, value: string | string[]) => void
  removeHeader: (name: string) => void
  req: FakeReq
  getHeader: (name: string) => string | string[] | undefined
  getHeaders: () => Headers
  hasHeader: (name: string) => boolean
};

const defaultOptions = {
  enableHTTPCompression: false,
};

const isGzipSupported = (headers: CloudFrontHeaders) => {
  let gz = false;
  const ae = headers['accept-encoding'];
  if (ae) {
    for (let i = 0; i < ae.length; i += 1) {
      const { value } = ae[i];
      const bits = value.split(',').map((x) => x.split(';')[0].trim());
      if (bits.indexOf('gzip') !== -1) {
        gz = true;
      }
    }
  }
  return gz;
};

const readOnlyCloudFrontHeaders = {
  'accept-encoding': true,
  'content-length': true,
  'if-modified-since': true,
  'if-none-match': true,
  'if-range': true,
  'if-unmodified-since': true,
  'transfer-encoding': true,
  via: true,
};

const toCloudFrontHeaders = (
  headers: Headers,
  originalNames: { [lowerCaseName: string] : string },
  existingHeaders : CloudFrontHeaders,
) : CloudFrontHeaders => {
  const result = {} as CloudFrontHeaders;

  Object.entries(existingHeaders).forEach(([headerName, headerValue]) => {
    result[headerName.toLowerCase()] = headerValue;
  });

  Object.entries(headers).forEach(([headerName, headerValue]) => {
    const nameLower = headerName.toLowerCase();
    const nameOriginal = originalNames[nameLower] || headerName;

    if (readOnlyCloudFrontHeaders[nameLower]) {
      return;
    }

    result[nameLower] = [];

    if (headerValue instanceof Array) {
      headerValue.forEach((val) => {
        if (val) {
          result[nameLower].push({
            key: nameOriginal,
            value: val.toString(),
          });
        }
      });
    } else if (headerValue) {
      result[nameLower].push({
        key: nameOriginal,
        value: headerValue.toString(),
      });
    }
  });

  return result;
};

/**
 *
 * @param cloudFrontEvent
 * @param enableHTTPCompression
 */
const cloudFrontEventCompat = (
  cloudFrontEvent: CloudFrontEvent,
  { enableHTTPCompression } = defaultOptions,
) : { responsePromise: Promise<CloudFrontResponse>, req: any, res: any } => {
  const { request: cfRequest, response: cfResponse = { headers: {} } } = cloudFrontEvent;

  const newStream = new Stream.Readable();

  const req : FakeReq = Object.assign(newStream, http.IncomingMessage.prototype) as FakeReq;
  req.url = cfRequest.uri;
  req.method = cfRequest.method;
  req.rawHeaders = [];
  req.headers = {};
  req.connection = {};

  if (cfRequest.querystring) {
    req.url = `${req.url}?${cfRequest.querystring}`;
  }

  const headers: CloudFrontHeaders = cfRequest.headers || {};

  Object.keys(headers).forEach((nameLow) => {
    const headerKeyValPairs = headers[nameLow];

    headerKeyValPairs.forEach((keyVal) => {
      req.rawHeaders.push(keyVal.key);
      req.rawHeaders.push(keyVal.value);
    });

    req.headers[nameLow] = headerKeyValPairs[0].value;
  });

  req.getHeader = (name: string) => req.headers[name.toLowerCase()];

  req.getHeaders = () => req.headers;

  if (cfRequest.body && cfRequest.body.data) {
    req.push(
      cfRequest.body.data,
      cfRequest.body.encoding ? 'base64' : undefined,
    );
  }

  req.push(null);

  const cloudFrontResponse : CloudFrontResponse = {
    headers: {},
  } as CloudFrontResponse;

  const res = new Stream() as FakeRes;
  res.finished = false;

  Object.defineProperty(res, 'statusCode', {
    get() {
      return cloudFrontResponse.status;
    },
    set(statusCode) {
      cloudFrontResponse.status = statusCode.toString();
      cloudFrontResponse.statusDescription = http.STATUS_CODES[statusCode];
    },
  });

  res.headers = {};
  // Keep in memory the original case of headers
  const originalCaseHeaderNames : { [lowerCaseName: string] : string } = {};
  res.writeHead = (status: string | number, newHeaders: Headers) => {
    cloudFrontResponse.status = status.toString();
    cloudFrontResponse.statusDescription = http.STATUS_CODES[status]; // HttpStatusCodes[status];

    if (newHeaders) {
      res.headers = Object.assign(res.headers, newHeaders);
    }
    return res;
  };
  res.write = (chunk) => {
    if (!cloudFrontResponse.body) {
      cloudFrontResponse.body = Buffer.from('');
    }

    cloudFrontResponse.body = Buffer.concat([
      // @ts-ignore
      cloudFrontResponse.body,
      Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk),
    ]);
  };

  const shouldGzip = enableHTTPCompression && isGzipSupported(headers);

  const responsePromise : Promise<CloudFrontResponse> = new Promise((resolve) => {
    res.end = (text) => {
      if (res.finished === true) {
        return;
      }

      res.finished = true;

      if (text) res.write(text);

      if (!res.statusCode) {
        res.statusCode = 200;
      }

      if (cloudFrontResponse.body) {
        cloudFrontResponse.bodyEncoding = 'base64';
        cloudFrontResponse.body = shouldGzip
          ? zlib.gzipSync(cloudFrontResponse.body).toString('base64')
          : Buffer.from(cloudFrontResponse.body).toString('base64');
      }

      cloudFrontResponse.headers = toCloudFrontHeaders(
        res.headers,
        originalCaseHeaderNames,
        cfResponse.headers,
      );

      if (shouldGzip) {
        cloudFrontResponse.headers['content-encoding'] = [
          { key: 'Content-Encoding', value: 'gzip' },
        ];
      }
      resolve(cloudFrontResponse);
    };
  });

  res.setHeader = (name: string, value: string) => {
    res.headers[name.toLowerCase()] = value;
    originalCaseHeaderNames[name.toLowerCase()] = name;
  };
  res.removeHeader = (name: string) => {
    delete res.headers[name.toLowerCase()];
  };
  res.getHeader = (name: string) => res.headers[name.toLowerCase()];
  res.getHeaders = () => res.headers;
  res.hasHeader = (name: string) => !!res.getHeader(name);

  res.req = req;

  return {
    req,
    res,
    responsePromise,
  };
};

export default cloudFrontEventCompat;
