export interface MultiArmedBanditArgs {
  epsilon: number
}

export const DEFAULT_MAB_ARGS: MultiArmedBanditArgs = {

  // Taken from common values in literature
  epsilon: 0.02,
}

/**
 * 
 * @param args 
 */
export function EpsilonGreedyAlgo(args: Partial<MultiArmedBanditArgs> = DEFAULT_MAB_ARGS) {
  const appliedArgs = Object.assign({}, args)
  const { epsilon } = appliedArgs

  // TODO: TEST
}
