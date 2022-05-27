import { PropsWithChildren, Suspense, useContext, useEffect, useState } from "react"

import { InstantBanditProps, LoadState } from "../lib/types"
import { ClientContext, DEFAULT_CONTEXT_STATE, InstantBanditContext, InstantBanditState } from "../lib/contexts"
import { Site } from "../lib/models"
import { defined, useIsomorphicLayoutEffect } from "../lib/utils"
import { FALLBACK_SITE } from "../lib/InstantBandit"


// TODO: Forward declarations of variants
// TODO: Check variants
// TODO: Separate out internal state tracking / contexts
// TODO: Throw if passed a site object that doesn't match the name prop

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

  // Fetches the variants, selects a variant, and initializes the component
  async function load() {
    try {

      // TODO: Look into why this is/was required for hydration sync
      await Promise.resolve()

      const site = await client.load()
      initialize(site)

      // Client doesn't throw, so we check the error after the fact
      if (client.error) {
        console.warn(`[IB] Error fetching site data: ${client.error}`)
      }

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

    if (props.onReady) {
      try {
        props.onReady(state)
      } catch (err) {
        console.warn(`[IB] An error occurred while handling a ready event: ${err}`)
      }
    }
  }

  // Initializes the IB and selects a variant
  async function initialize(site?: Site | null, error?: Error) {

    await client.init(site!, selectProp)
    const variant = client.variant
    state.error = error!
    state.site = FALLBACK_SITE
    state.siteName = site!.name
    state.variant = variant!

    if (defined(site) && (state.state === LoadState.WAIT || state.state === LoadState.PRELOAD)) {
      await client.init(site!, selectProp)
      const variant = client.variant
      state.site = site!
      state.siteName = site!.name
      state.variant = variant!

      broadcastReadyState()
      return
    }

    if (error && state.state === LoadState.WAIT) {


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

  // NOTE: Deferring the initial "ready" state update to a layout effect means
  // the state change happens *synchronously* and before the next paint.
  // This helps reduce the visual flicker upon load.
  useIsomorphicLayoutEffect(() => {
    if (ready) {
      setBanditState(state)
    }
  }, [ready])

  return (
    <InstantBanditContext.Provider value={state}>
      {ready && props.children}
    </InstantBanditContext.Provider>
  )
}

function createNewBanditState(props: InstantBanditProps): InstantBanditState {
  const state = Object.assign({}, DEFAULT_CONTEXT_STATE)
  return state
}
