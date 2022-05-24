
export interface MetricsBucket {
  [metric: string]: number
}

export interface Experiment {
  name: string
  metrics?: MetricsBucket
}

export interface ExperimentMeta extends Experiment {
  name: string
  desc?: string
  metrics: MetricsBucket
}

export interface Site {
  name: string
  select?: string | null
  experiments: readonly Experiment[]
}

export interface SiteMeta extends Site {
  experiments: readonly ExperimentMeta[]
}
