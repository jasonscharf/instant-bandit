import { CSSProperties, PropsWithChildren, useContext, useEffect, useState } from "react"
import { DEFAULT_SCOPE_CONTEXT, InstantBanditContext, InstantBanditLoadState, InstantBanditScope, ScopeContext } from "../lib/contexts"


export interface ExperimentComponentProps {
  name?: string
  default?: boolean
}

export function Experiment(props: PropsWithChildren<ExperimentComponentProps>) {
  const { default: isDefaultProp, name } = props
  const { experiment, state: banditState, options: settings, site } = useContext(InstantBanditContext)
  const [scopeState, setScopeState] = useState<InstantBanditScope>(() => Object.assign({}, DEFAULT_SCOPE_CONTEXT))

  const isDefault = !!isDefaultProp
  const isSelected = (experiment && experiment.name === name)
  const banditIsPreSelection = banditState !== InstantBanditLoadState.READY

  function shouldBePresent() {
    return isSelected || (isDefault && banditIsPreSelection)
  }

  const present = shouldBePresent()

  console.info(`[IB] Render variant '${name}' present? ${present} default? ${isDefault} selected? ${isSelected} pre-selection state? ${banditIsPreSelection}`)


  // DEBUG
  const maybeOverlaid = (isDefault && banditIsPreSelection)
    ? <div style={overlayStyle}>{props.children}</div>
    : props.children

  /*
  return (
    <>{present && maybeOverlaid}</>
  )*/

  return (
    <ScopeContext.Provider value={scopeState}>
      {present && props.children}
    </ScopeContext.Provider>
  )
}

const overlayStyle: CSSProperties = {
  position: "relative",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  pointerEvents: "none",
}
