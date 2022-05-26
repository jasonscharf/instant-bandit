
export interface Experiment {
  name: string
  metrics?: MetricsBucket
}

/**
 * Metadata about a particular variant
 */
export interface ExperimentMeta extends Experiment {
  desc?: string
  metrics: MetricsBucket
}

/**
 * Configuration, including variants, for a particular website or web app.
 */
export interface Site {
  name: string
  select?: string | null
  session?: string | null
  experiments: readonly Experiment[]
}

/**
 * Metadata about a `Site`, intended for use by backends.
 */
export interface SiteMeta extends Site {
  origin: string
  experiments: readonly ExperimentMeta[]
}

/**
 * An aggregated bucket of metrics for a particular variant
 */
export interface MetricsBucket {
  [metric: string]: number
}

/**
 * An individual metric sample to report to a metrics sink such as a Redis backend.
 */
export interface MetricsSample {
  ts: number
  origin: string
  session: string
  site: string
  variant: string
  metric: number
  value: number
}
