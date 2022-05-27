import React from "react"

import { InstantBanditClient } from "./InstantBandit"
import { LoadState } from "./types"
import { Variant, Site } from "./models"
import { DEFAULT_SITE_NAME } from "./constants"


export interface Scope {
  siteName: string
  variant: Variant | null
}

const globalClient = new InstantBanditClient()
export const ClientContext = React.createContext(globalClient)


export interface InstantBanditState extends Scope {
  state: LoadState
  error?: Error
  site: Site | null
  siteName: string
  variant: Variant | null
}

export const DEFAULT_CONTEXT_STATE: InstantBanditState = {
  state: LoadState.PRELOAD,
  site: null,
  siteName: DEFAULT_SITE_NAME,
  variant: null,
}
Object.freeze(DEFAULT_CONTEXT_STATE)


export const InstantBanditContext: React.Context<InstantBanditState> =
  React.createContext<InstantBanditState>(DEFAULT_CONTEXT_STATE)

export const DEFAULT_SCOPE_CONTEXT: Scope = {
  siteName: DEFAULT_SITE_NAME,
  variant: null,
}

export const ScopeContext = React.createContext<Scope>(DEFAULT_SCOPE_CONTEXT)
