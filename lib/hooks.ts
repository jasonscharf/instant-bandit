import { useContext } from "react"
import { InstantBanditContext, Scope, InstantBanditState, ScopeContext } from "./contexts"


export function useBandit(): InstantBanditState & Scope {
  const { state, site } = useContext(InstantBanditContext)
  const { experiment, siteName } = useContext(ScopeContext)

  return {
    state,
    error: null,
    site,
    siteName,
    experiment,
  }
}
