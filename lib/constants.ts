export const COOKIE_EXPERIMENT_ID = "ib.experiment-id"
export const COOKIE_SITE_ID = "ib.site.id"

export const DEFAULT_NAME = "default"
export const DEFAULT_SITE_NAME = DEFAULT_NAME
export const DEFAULT_BASE_URL = "http://localhost:3000"
export const DEFAULT_SITE_PATH = "api/site"
export const DEFAULT_METRICS_PATH = "api/metrics"

// TODO: Whitelist these with CORS
export const HEADER_SESSION = "X-IB-Session"
export const HEADER_SITE = "X-IB-Site"


/**
 * Metrics tracked by Instant Bandit
 */
export enum Metrics {
  EXPOSURES = "exposures",
  CONVERSIONS = "conversions",
}
