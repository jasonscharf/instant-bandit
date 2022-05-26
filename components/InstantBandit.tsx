import { PropsWithChildren, useContext, useState } from "react"

import { InstantBanditProps } from "../lib/types"
import { Experiment, Site } from "../lib/models"
import { ClientContext, DEFAULT_CONTEXT_STATE, InstantBanditContext, LoadState, InstantBanditState } from "../lib/contexts"
import { defined, useIsomorphicLayoutEffect } from "../lib/utils"
import { DEFAULT_NAME, DEFAULT_SITE_NAME } from "../lib/constants"


const DEFAULT_SITE_PATH = "api/site"
const DEFAULT_FETCHER = (...args) => (fetch as any)(...args).then(res => res.json())

const DEBUG_FETCH = async (...args) => {
  const resp = await DEFAULT_FETCHER(...args)
  return resp
}

// TODO: Pre-fetch
// TODO: Make context internal, expose state and experiment via Jotai
// TODO: Fallback behaviour when metrics are unavailable
// TODO: Extract selection logic to client
// TODO: Forward declarations of experiments
// TODO: Check experiments
// TODO: Set cookie through a delegate
// TODO: Separate out internal state tracking / contexts

export const InstantBandit = (props: PropsWithChildren<InstantBanditProps>) => {
  const [state, setBanditState] = useState(() => createNewBanditState(props))
  const client = useContext(ClientContext)

  const [ready, setReady] = useState(false)

  const {
    debug,
    experiments,
    fetcher,
    block: blockProp,
    select: selectProp,
    site: siteProp,
  } = props

  // TODO: Note about state transitions and context changes forcing updated

  if (siteProp && state.state === LoadState.PRELOAD) {
    console.info(`[IB] Got site from props, initializing...`)
    initialize(siteProp)
  }

  // Fetches the experiments + metrics
  async function load() {
    try {

      // TODO: NOTE: This is required for hydration sync. It is unclear why.
      await Promise.resolve()

      console.info(`[IB] Fetching site data...`)
      const site = await client.load()

      console.info(`[IB] Got site data`, site)
      initialize(site)
    } catch (err) {
      console.warn(`[IB] Error fetching site data: ${err}`)
      initialize(null, err)
    }
  }

  // Dispatching the initial "ready" state update drastically reduces visible flicker.
  useIsomorphicLayoutEffect(() => {
    if (ready) {
      setBanditState({ ...state })
    }
  }, [ready])

  // Invokes a render and an onReady callback
  function broadcastReadyState() {
    state.state = LoadState.READY
    setReady(true)
    setBanditState({ ...state })

    console.info(`[IB] Bandit ready`, state)

    if (props.onReady) {
      try {
        props.onReady(state)
      } catch (err) {
        console.warn(`[IB] An error occurred while handling a ready event: ${err}`)
      }
    }
  }


  // Selects the appropriate experiment.
  // If the "select" property of the site model is set, it indicates that selection
  // was performed server-side, or intentionally set by an author.
  function selectExperiment() {
    state.state = LoadState.SELECTING

    let selectedExperiment: Experiment | null = null
    if (!state.site) {
      console.info(`[IB] Using fallback site model`)
      state.site = FALLBACK_SITE
    }

    const { site } = state
    let experimentName = DEFAULT_NAME

    // If the "select" field is present in the model, it is observed
    if (defined(selectProp)) {
      selectedExperiment = selectSpecific(selectProp!)
    } else if (defined(state.site.select)) {
      selectedExperiment = selectSpecific(state.site.select!)
    } else if (!selectedExperiment) {
      selectedExperiment = selectFallbackFor(DEFAULT_NAME)
    }

    state.experiment = selectedExperiment
    state.state = LoadState.READY

    console.info(`[IB] Bandit selects experiment "${state.experiment?.name}"`, state.experiment)
  }

  // No matching experiment? Use the fallback
  function selectFallbackFor(desiredExperiment: string) {
    console.warn(`[IB] Could not find experiment '${desiredExperiment}'. Falling back to '${DEFAULT_NAME}'`)
    let fallback = FALLBACK_SITE.experiments[0]
    if (!fallback) {
      fallback = {
        name: DEFAULT_NAME,
        metrics: {
          exposures: 0,
          conversions: 0,
        },
      } as Experiment
    }

    return fallback
  }

  // Selects a specific experiment by name
  function selectSpecific(experimentName: string) {
    console.info(`[IB] Select '${experimentName}'`)
    const { site } = state
    return site!.experiments.find(e => e.name === experimentName) ?? null
  }

  // Initializes the IB and selects an experiment
  // TODO: Test error handling - must continue when site config absent
  function initialize(data?: Site | null, error?: Error | null) {
    if (defined(data) && (state.state === LoadState.WAIT || state.state === LoadState.PRELOAD)) {
      console.info(`[IB] Bandit received config`, data, error)

      state.site = data!
      selectExperiment()

      state.state = LoadState.READY
      broadcastReadyState()
      return
    }

    if (error && state.state === LoadState.WAIT) {
      console.warn(`[IB] Error fetching config`, error)

      state.error = error

      // We select even if a server is not available at the moment
      state.site = FALLBACK_SITE
      selectExperiment()

      try {
        if (props.onError) {
          props.onError(error, state)
        }
      } catch (err) {
        console.warn(`[IB] An error occurred while handling an initialization error: ${err}`)
      }

      broadcastReadyState()
      return
    }
  }

  // Kick-off the initialization process
  if (state.state === LoadState.PRELOAD) {
    state.state = LoadState.WAIT

    // If we have a model from props, use that definition, including any metrics baked
    load()
  }

  const isRenderingOnServer = typeof window === "undefined"
  if (isRenderingOnServer) {
    console.info(`[IB] [Server render]`)
  }

  return (
    <InstantBanditContext.Provider value={state}>
      {props.children}
    </InstantBanditContext.Provider>
  )
}

// If a site model can't be loaded remotely and none was supplied locally,
// this model is used as the fallback, specifying only the invariant
export const FALLBACK_SITE: Site = {
  name: DEFAULT_SITE_NAME,
  select: DEFAULT_NAME,
  experiments: [
    {
      name: DEFAULT_NAME,
      metrics: {
        exposures: 0,
        clicks: 0,
      }
    }
  ]
} as const
Object.freeze(FALLBACK_SITE)

function createNewBanditState(props: InstantBanditProps): InstantBanditState {
  const state = Object.assign({}, DEFAULT_CONTEXT_STATE)
  return state
}
