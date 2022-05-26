import { CSSProperties, PropsWithChildren, useContext, useState } from "react"
import { DEFAULT_SCOPE_CONTEXT, InstantBanditContext, LoadState, Scope, ScopeContext } from "../lib/contexts"


export interface PlaceholderComponentProps {

  /** If `true`, shows the placeholder content rather than setting 0 opacity */
  show?: boolean
}

/**
 * Represents a specific variation of a component or tree of components
 * @param props 
 * @returns 
 */
export function Placeholder(props: PropsWithChildren<PlaceholderComponentProps>) {
  const { show } = props
  const { state: banditState } = useContext(InstantBanditContext)

  const banditReady = banditState === LoadState.READY

  if (banditReady) {
    return null
  }

  return (
    <div style={show ? styleVisible : styleHidden}>
      {props.children}
    </div>
  )
}

export const styleVisible: CSSProperties = {
  opacity: 1,
}

export const styleHidden: CSSProperties = {
  opacity: 0,
}

