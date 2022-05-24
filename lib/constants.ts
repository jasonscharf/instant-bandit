export const DEFAULT_BASE_URL = "localhost:3000"
export const DEFAULT_NAME = "default"
export const COOKIE_EXPERIMENT_ID = "ib.experiment-id"
export const COOKIE_SITE_ID = "ib.site.id"


export const DEFAULT_SITE_NAME = DEFAULT_NAME

/**
 * Metrics tracked by Instant Bandit
 */
export enum Metrics {
  EXPOSURES = "exposures",
  CONVERSIONS = "conversions",
}
