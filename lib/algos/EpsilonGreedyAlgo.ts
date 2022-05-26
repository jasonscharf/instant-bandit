export interface MultiArmedBanditArgs {
  epsilon: number
}

export const DEFAULT_MAB_ARGS: MultiArmedBanditArgs = {

  // Common empirical value
  epsilon: 0.02,
}

/**
 * Implementation of an Epislon-greedy multi-armed-bandit algorithm
 * @param args 
 */
export function EpsilonGreedyAlgo(args: Partial<MultiArmedBanditArgs> = DEFAULT_MAB_ARGS) {
  const appliedArgs = Object.assign({}, args)
  const { epsilon } = appliedArgs

}
