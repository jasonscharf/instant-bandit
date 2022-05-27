import { AlgorithmImpl, AlgorithmResults, SelectionArgs } from "../types"

export interface MultiArmedBanditArgs {
  epsilon: number
}

export const DEFAULT_MAB_ARGS: MultiArmedBanditArgs = {

  // Common empirical value
  epsilon: 0.02,
}

/**
 * Implementation of an Epsilon-greedy multi-armed-bandit algorithm
 */

export class EpsilonGreedyBanditAlgo implements AlgorithmImpl<MultiArmedBanditArgs> {
  async select(args: SelectionArgs) {
    const { site } = args
    const { variants } = site

    // STUB

    const results: AlgorithmResults = {
      winner: variants[0],
      metrics: {},
      pValue: 0,
    }
    return results
  }
}
