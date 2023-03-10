// eslint-disable-next-line import/no-extraneous-dependencies
import NextServerBundle from 'next/dist/server/next-server';
// eslint-disable-next-line import/no-extraneous-dependencies
import { NodeNextRequest, NodeNextResponse } from 'next/dist/server/base-http/node';

import { join } from 'path';

import cloudFrontEventCompat from './cloudFrontEventCompat';
import { CloudFrontResponse } from './CloudFrontResponse';
import { CloudFrontHeaders } from './CloudFrontHeaders';
import { CloudFrontEvent } from './CloudFrontEvent';
import { RouteManifest } from './RouteManifest';

// @ts-ignore
const NextServer = NextServerBundle.default;

// process.env.NODE_ENV = 'production';
process.chdir(__dirname);

// Make sure commands gracefully respect termination signals (e.g. from Docker)
// Allow the graceful termination to be manually configurable
if (!process.env.NEXT_MANUAL_SIG_HANDLE) {
  process.on('SIGTERM', () => process.exit(0));
  process.on('SIGINT', () => process.exit(0));
}

const hostname = process.env.HOSTNAME || 'localhost';

const blacklistedHeaders = [
  'connection',
  'expect',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'proxy-connection',
  'trailer',
  'upgrade',
  'x-accel-buffering',
  'x-accel-charset',
  'x-accel-limit-rate',
  'x-accel-redirect',
  'x-cache',
  'x-forwarded-proto',
  'x-real-ip',
];

const blacklistedHeaderPrefixes = ['x-amz-cf-', 'x-amzn-', 'x-edge-'];

function isBlacklistedHeader(name: string) {
  const lowerCaseName = name.toLowerCase();

  for (const prefix of blacklistedHeaderPrefixes) {
    if (lowerCaseName.startsWith(prefix)) {
      return true;
    }
  }

  return blacklistedHeaders.includes(lowerCaseName);
}

function removeBlacklistedHeaders(headers: CloudFrontHeaders) {
  Object.keys(headers).forEach((header) => {
    if (isBlacklistedHeader(header)) {
      delete headers[header];
    }
  });
}

// eslint-disable-next-line import/no-unresolved
const requiredServerFiles = require('./.next/required-server-files.json');
// eslint-disable-next-line import/no-unresolved,global-require
const routeManifest = require('./.next/routes-manifest.json') as RouteManifest;

const nextServer = new NextServer({
  hostname,
  port: 3000,
  dir: join(__dirname),
  dev: false,
  customServer: false,
  // Compress fails
  conf: { ...requiredServerFiles.config, compress: false },
});
const nextHandler = nextServer.getRequestHandler();

// Azure lambda requires non-default export
// eslint-disable-next-line @typescript-eslint/no-unused-vars,import/prefer-default-export
export const handler = async (event, context) => {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(event));
  const cloudFrontEvent = event.Records[0].cf as CloudFrontEvent;

  // HANDLE REDIRECTIONS //
  // TODO

  // SKIP STATIC ROUTES //
  const staticRoute = routeManifest.staticRoutes
    .find((route) => cloudFrontEvent.request.uri.match(route.regex));

  if (staticRoute) return null;

  // SKIP PUBLIC ASSETS //
  // TODO

  const { req, res, responsePromise } = cloudFrontEventCompat(
    cloudFrontEvent,
    { enableHTTPCompression: false },
  );

  try {
    // @ts-ignore
    await nextHandler(new NodeNextRequest(req), new NodeNextResponse(res));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.statusCode = 500;
    res.end(`internal server error. ${new Date()}`);
  }

  const response : CloudFrontResponse = await responsePromise;

  // Remove any blacklisted headers from CloudFront response
  if (response.headers) {
    removeBlacklistedHeaders(response.headers);
  }

  return response;
};
