import { InstantBanditState } from "./contexts"
import { Experiment, Site } from "./models"

export type Variant = string
export type Probability = number

/**
 * Map of probabilities that should add up to 1.0.
 */
export type ProbabilityDistribution = Record<Variant, Probability>


export interface InstantBanditProps {
  preserveSession?: boolean
  probabilities?: ProbabilityDistribution
  experiments?: string[]
  select?: string
  site?: Site
  block?: boolean
  fetcher?: (...args: any[]) => any
  debug?: boolean

  // TODO: Remove or hide there. They are really just used for testing async behaviour
  onReady?: (state: InstantBanditState) => void
  onError?: (err: Error | null, state: InstantBanditState | null) => void
}

export interface AlgorithmImpl<TAlgoArgs, TMetadata = unknown> {
  select(args: SelectionArgs): Promise<{ selection: Experiment, meta?: TMetadata }>
}

export type SelectionArgs = {
  algo: Algorithm | string
  variants: Experiment[]
}

export type SelectionDelegate = (args: SelectionArgs) => Promise<Experiment>

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

/**
 * Algorithms to use when selecting a variant.
 * See the README for an overview.
 */
export enum Algorithm {
  RANDOM = "random",
  EPSILON_GREEDY = "epsilon-greedy-mab",
}

export type AlgorithmFactory = () => Experiment
export type AlgorithmBlock = Record<string, AlgorithmFactory>
