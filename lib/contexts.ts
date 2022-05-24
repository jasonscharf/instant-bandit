import React from "react"
import { Experiment, Site } from "./models"
import { InstantBanditProps } from "./types"
import { DEFAULT_NAME, DEFAULT_SITE_NAME } from "./constants"


export enum InstantBanditLoadState {
  PRELOAD = "pre",
  WAIT = "wait-for-data",
  SELECTING = "selecting",
  READY = "ready",
}

/**
 * Holds Instant Bandit state and helper functions
 */

export interface InstantBanditScope {
  siteName: string
  experiment: Experiment | null
  scope: string[] | []
}


// TODO: To interface if no global methods are used
export class InstantBanditState implements InstantBanditScope {
  state: InstantBanditLoadState
  options: InstantBanditProps | null
  site: Site | null
  siteName = DEFAULT_SITE_NAME
  experiment: Experiment | null
  scope: string[] = []
  error: Error | null
}

export const DEFAULT_IB_OPTIONS = {
}
Object.freeze(DEFAULT_IB_OPTIONS)

export const DEFAULT_CONTEXT_STATE = new InstantBanditState()
DEFAULT_CONTEXT_STATE.state = InstantBanditLoadState.PRELOAD
DEFAULT_CONTEXT_STATE.options = DEFAULT_IB_OPTIONS
DEFAULT_CONTEXT_STATE.site = null
DEFAULT_CONTEXT_STATE.scope = []
DEFAULT_CONTEXT_STATE.experiment = null
DEFAULT_CONTEXT_STATE.siteName = DEFAULT_SITE_NAME
DEFAULT_CONTEXT_STATE.error = null
Object.freeze(DEFAULT_CONTEXT_STATE)


export const InstantBanditContext: React.Context<InstantBanditState> =
  React.createContext<InstantBanditState>(DEFAULT_CONTEXT_STATE)

export const DEFAULT_SCOPE_CONTEXT: InstantBanditScope = {
  siteName: DEFAULT_SITE_NAME,
  experiment: null,
  scope: [],
}

export const ScopeContext = React.createContext<InstantBanditScope>(DEFAULT_SCOPE_CONTEXT)
