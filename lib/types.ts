import { InstantBanditState } from "./contexts"
import { MetricsBucket, Site, Variant as VariantModel } from "./models"


export type Variant = string
export type Probability = number

/**
 * Map of probabilities that should add up to 1.0.
 */
export type ProbabilityDistribution = Record<Variant, Probability>


export interface InstantBanditProps {
  preserveSession?: boolean
  probabilities?: ProbabilityDistribution
  variants?: string[]
  select?: string
  site?: Site
  block?: boolean
  fetcher?: (...args: any[]) => any
  debug?: boolean
  onReady?: (state: InstantBanditState) => void
  onError?: (err: Error | null, state: InstantBanditState | null) => void
}

export interface AlgorithmImpl<TAlgoArgs = unknown, TMetadata = unknown> {
  select<TAlgoArgs>(args: TAlgoArgs & SelectionArgs): Promise<AlgorithmResults>
}

export type SelectionArgs = {
  algo: Algorithm | string
  site: Site
}

export type SelectionDelegate = (args: SelectionArgs) => Promise<Variant>

export type ConversionOptions = {
  experimentIds?: string[] // whitelist of experiments to associate with the conversion
  value?: number // optional value of the conversion
}

export type Counts = {
  [variant: string]: number
}

export type ProbabilitiesResponse = {
  name: string
  probabilities: ProbabilityDistribution | null
  pValue: PValue | null
}

// p-value of difference between variants
export type PValue = number


export enum LoadState {
  PRELOAD = "pre",
  WAIT = "wait-for-data",
  SELECTING = "selecting",
  READY = "ready",
}

/**
 * Algorithms to use when selecting a variant.
 */
export enum Algorithm {
  RANDOM = "random",
  MAB_EPSILON_GREEDY = "mab-epsilon-greedy",
}

export type AlgorithmFactory = () => AlgorithmImpl
export type Algorithms = Record<string, AlgorithmFactory>
export interface AlgorithmResults {
  pValue: number
  metrics: MetricsBucket
  winner: VariantModel
}


/**
 * Describes a serializable descriptor for a user session.
 * Serializable into local storage facilities.
 */
export interface SessionDescriptor {
  origin: string
  sid: string
  uid: string
  site: string | null
  variant: Variant | null
}

// Node and DOM typings differ
export type TimerLike = any
