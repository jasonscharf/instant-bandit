import { PropsWithChildren, useContext, useEffect, useState } from "react"

import { InstantBanditProps } from "../lib/types"
import { ClientContext, DEFAULT_CONTEXT_STATE, InstantBanditContext, LoadState, InstantBanditState } from "../lib/contexts"
import { Site } from "../lib/models"
import { defined, useIsomorphicLayoutEffect } from "../lib/utils"
import { FALLBACK_SITE } from "../lib/InstantBandit"


// TODO: Forward declarations of variants
// TODO: Check variants
// TODO: Separate out internal state tracking / contexts

export const InstantBandit = (props: PropsWithChildren<InstantBanditProps>) => {
  const [state, setBanditState] = useState(createNewBanditState(props))
  const client = useContext(ClientContext)

  const [ready, setReady] = useState(false)

  const {
    debug,
    variants,
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

  useEffect(() => {
    console.log(`[IB] UseEffect`)
  }, [state])

  // Fetches the variants, selects a variant, and initializes the component
  async function load() {
    try {

      // TODO: NOTE: This is required for hydration sync. It is unclear why.
      await Promise.resolve()

      console.info(`[IB] Fetching site data...`)
      const site = await client.load()

      initialize(site)
    } catch (err) {
      console.warn(`[IB] Error fetching site data: ${err}`)
      initialize(null, err)
    }
  }

  function log(...items: unknown[]) {
    if (!debug) return
    console.info(...items)
  }

  // Invokes a render and an onReady callback
  function broadcastReadyState() {
    state.state = LoadState.READY

    // Setting this to pick up in layoutEffect
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

  // Initializes the IB and selects a variant
  // TODO: Test error handling - must continue when site config absent
  async function initialize(site?: Site | null, error?: Error | null) {

    if (defined(site) && (state.state === LoadState.WAIT || state.state === LoadState.PRELOAD)) {
      console.info(`[IB] Bandit received config`, site)

      const variant = await client.selectVariant(site!, selectProp)
      state.site = site!
      state.variant = variant!
      broadcastReadyState()
      return
    }

    if (error && state.state === LoadState.WAIT) {
      console.warn(`[IB] Error fetching configuration`, error)
      state.error = error
      state.site = FALLBACK_SITE
      state.variant = await client.selectVariant(site!, selectProp)

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
  if (state.state === LoadState.PRELOAD && !siteProp) {
    state.state = LoadState.WAIT

    // If we have a model from props, use that definition, including any metrics baked
    load()
  }

  const isRenderingOnServer = typeof window === "undefined"
  if (isRenderingOnServer) {
    console.info(`[IB] [Server render]`)
  }

  // Dispatching the initial "ready" state update during a layout effect means
  // the state change happens *synchronously* and before the next paint.
  // This helps reduce the visual flicker when sites are loading in async
  useIsomorphicLayoutEffect(() => {
    if (ready) {
      setBanditState(state)
    }
  }, [ready])


  return (
    <InstantBanditContext.Provider value={state}>
      {props.children}
    </InstantBanditContext.Provider>
  )
}

function createNewBanditState(props: InstantBanditProps): InstantBanditState {
  const state = Object.assign({}, DEFAULT_CONTEXT_STATE)
  return state
}
