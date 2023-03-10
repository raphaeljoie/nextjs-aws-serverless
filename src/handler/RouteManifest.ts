export type RouteManifest = {
  version: number
  staticRoutes: {
    page: string
    regex: string
    routeKeys: string
    namedRegex: string
  }[]
};
