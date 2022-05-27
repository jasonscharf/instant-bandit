import { useContext, useEffect, useState } from "react"
import { InstantBanditContext, Scope, InstantBanditState, ScopeContext } from "./contexts"


/**
 * Gets the imperative API for tracking metrics.
 * @returns 
 */
export function useBandit(): InstantBanditState & Scope {
  const { state, site } = useContext(InstantBanditContext)
  const { variant, siteName } = useContext(ScopeContext)

  return {
    state,
    site,
    siteName,
    variant,
  }
}

const DEFAULT_OPTIONS = {
  config: {
    attributes: true,
    attributeOldValue: true,
    characterData: true,
    childList: true,
    subtree: true,
  },
}

/**
 * For debugging purposes
 * @param targetEl 
 * @param cb 
 * @param options 
 */
export function useMutationObservable(targetEl, cb, options = DEFAULT_OPTIONS) {
  const [observer, setObserver] = useState<MutationObserver>(null as any)

  useEffect(() => {
    const obs = new MutationObserver(cb)
    setObserver(obs)
  }, [cb, options, setObserver])

  useEffect(() => {
    if (!observer) return
    const { config } = options
    observer.observe(targetEl, config)
    return () => {
      if (observer) {
        observer.disconnect()
      }
    }
  }, [observer, targetEl, options])
}
