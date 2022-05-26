import React from "react"
import { Variant, Site } from "./models"
import { InstantBanditClient } from "./InstantBandit"
import { DEFAULT_SITE_NAME } from "./constants"


export enum LoadState {
  PRELOAD = "pre",
  WAIT = "wait-for-data",
  SELECTING = "selecting",
  READY = "ready",
}

export interface Scope {
  siteName: string
  variant: Variant | null
}

const globalClient = new InstantBanditClient()
export const ClientContext = React.createContext(globalClient)


export interface InstantBanditState extends Scope {
  state: LoadState
  error: Error | null
  site: Site | null
  siteName: string
  variant: Variant | null
}

export const DEFAULT_CONTEXT_STATE: InstantBanditState = {
  state: LoadState.PRELOAD,
  error: null,
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
