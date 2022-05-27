export const DEFAULT_NAME = "default"
export const DEFAULT_SITE_NAME = DEFAULT_NAME
export const DEFAULT_VARIANT_NAME = DEFAULT_NAME
export const DEFAULT_ORIGIN = "localhost"
export const DEFAULT_BASE_URL = "http://localhost:3000"
export const DEFAULT_SITE_PATH = "api/site"
export const DEFAULT_METRICS_PATH = "api/metrics"

export const HEADER_SITE = "X-IB-Site"
export const HEADER_VARIANT = "X-IB-Variant"
export const HEADER_SESSION_ID = "X-IB-Session"

export const COOKIE_VARIANT_ID = "ib.variant"
export const COOKIE_SITE_ID = "ib.site"


/**
 * Metrics tracked by Instant Bandit by default
 */
export enum Metrics {
  EXPOSURES = "exposures",
  CONVERSIONS = "conversions",
}
