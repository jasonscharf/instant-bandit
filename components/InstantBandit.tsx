import { PropsWithChildren, useContext, useState } from "react"
import useSWR from "swr"

import { Debug } from "./InstantBanditDebug"
import { InstantBanditProps } from "../lib/types"
import { Experiment, Site } from "../lib/models"
import { DEFAULT_CONTEXT_STATE, InstantBanditContext, InstantBanditLoadState, InstantBanditState } from "../lib/contexts"
import { defined } from "../lib/utils"
import { DEFAULT_NAME, DEFAULT_SITE_NAME } from "../lib/constants"
import experiments from "../pages/api/experiments"


const DEFAULT_SITE_PATH = "/api/site"
const DEFAULT_FETCHER = (...args) => (fetch as any)(...args).then(res => res.json())

const DEBUG_FETCH = async (...args) => {
  debugger
  const resp = await DEFAULT_FETCHER(...args)
  return resp
}


// TODO: Debug. rm
let count = 0

// TODO: Pre-fetch
// TODO: Make context internal, expose state and experiment via Jotai
// TODO: Fallback behaviour when metrics are unavailable
// TODO: Extract selection logic to client
// TODO: Forward declarations of experiments
// TODO: Check experiments
// TODO: Set cookie through a delegate
// TODO: Separate out internal state tracking / contexts

export const InstantBandit = (props: PropsWithChildren<InstantBanditProps>) => {
  ++count

  const ctx = useContext(InstantBanditContext)
  const [state, setBanditState] = useState(() => createNewBanditState(props))

  const {
    debug,
    experiments,
    fetcher,
    block: blockProp,
    select: selectProp,
    site: siteProp,
  } = props

  const configFetcher = debug ? DEBUG_FETCH : (fetcher ?? DEFAULT_FETCHER)
  const sitePath = DEFAULT_SITE_PATH + `?ts=${new Date().getTime()}`

  // TODO: We don't actually need SWR here - remove
  // const { data, error } = useSWR<Site, Error>(sitePath, configFetcher)
  // TODO: Note about state transitions and context changes forcing updated

  if (siteProp) {
    console.info(`[IB] Got site from props, initializing...`)
    initialize(siteProp)
  }

  // TODO: To client
  // Fetches the experiments + metrics
  async function fetchData() {
    try {
      // NOTE: This is required for hydration sync!
      await Promise.resolve()

      console.info(`[IB] Fetching experiments...`)
      const resp = await fetch(`http://localhost:3000/${sitePath}`)
      const data = await resp.json()

      console.info(`[IB] Got experiments`, data)
      initialize(data)
    } catch (err) {
      console.warn(`[IB] Error fetching experiments: ${err}`)
      initialize(null, err)
    }
  }

  // Invokes a render and an onReady callback
  function broadcastReadyState() {
    state.state = InstantBanditLoadState.READY
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
    state.state = InstantBanditLoadState.SELECTING

    let selectedExperiment: Experiment | null = null
    if (!state.site) {
      console.info(`[IB] Using fallback site model`)
      state.site = FALLBACK_SITE
    }

    const { site } = state
    let experimentName = DEFAULT_NAME

    // If the "select" field is present in the model, it is observed
    if (defined(selectProp) || defined(site.select)) {
      experimentName = selectProp ?? site.select ?? DEFAULT_NAME
      selectedExperiment = selectSpecific(experimentName)
    } else {
      // TODO: Extract selection logic //
      const { experiments } = state.site

      // TEMP: Pick random experiment
      const ix = Math.min(Math.floor(Math.random() * (experiments.length + 1)), experiments.length - 1)
      selectedExperiment = experiments[ix]
      // 
    }

    if (!selectedExperiment) {
      selectedExperiment = selectFallbackFor(experimentName)
    }

    state.experiment = selectedExperiment
    state.state = InstantBanditLoadState.READY

    console.info(`[IB] Bandit selects experiment "${state.experiment?.name}"`, state.experiment)
  }

  // No matching experiment? Use the fallback
  function selectFallbackFor(desiredExperiment: string) {
    console.warn(`[IB] could not find experiment '${desiredExperiment}'. Using '${DEFAULT_NAME}'`)
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
    const { site } = state
    return site!.experiments.find(e => e.name === experimentName) ?? null
  }

  // Initializes the IB and selects an experiment
  // TODO: Test error handling - must continue when site config absent
  function initialize(data?: Site | null, error?: Error | null) {
    if (defined(data) && (state.state === InstantBanditLoadState.WAIT || state.state === InstantBanditLoadState.PRELOAD)) {
      console.info(`[IB] Bandit received config`, data, error)

      state.site = data!
      selectExperiment()

      state.state = InstantBanditLoadState.READY
      broadcastReadyState()
      return
    }

    if (error && state.state === InstantBanditLoadState.WAIT) {
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
  if (state.state === InstantBanditLoadState.PRELOAD) {
    state.state = InstantBanditLoadState.WAIT

    // TODO: Note about intentionally not broadcasting state here
    //  - (the state is preserved in the context)
    // TODO: Note that this can result in stale UI in the Debug component. Address
    //setBanditState({ ...state })

    // If we have a model from props, use that definition, including any metrics baked
    fetchData()
  }

  const isRenderingOnServer= typeof window === "undefined"
  if (isRenderingOnServer) {
    console.info(`[IB] [Server render]`)
  }

  // TODO: Allow the bandit to optionally block child renders?
  if (blockProp && state.state === InstantBanditLoadState.WAIT) {
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
