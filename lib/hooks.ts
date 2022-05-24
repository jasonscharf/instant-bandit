import { useContext } from "react"
import { InstantBanditContext, InstantBanditScope, InstantBanditState, ScopeContext } from "./contexts"


export function useBandit(): InstantBanditState & InstantBanditScope {
  const { state, options, site } = useContext(InstantBanditContext)
  const { experiment, scope, siteName } = useContext(ScopeContext)

  return {
    error: null,
    experiment,
    options,
    site,
    siteName,
    state,
    scope,
  }
}
