import { PropsWithChildren, useContext, useState } from "react"
import { DEFAULT_SCOPE_CONTEXT, InstantBanditContext, LoadState, Scope, ScopeContext } from "../lib/contexts"


export interface ExperimentComponentProps {
  name?: string
  default?: boolean
}

/**
 * Represents a specific variation of a component or tree of components
 * @param props 
 * @returns 
 */
export function Experiment(props: PropsWithChildren<ExperimentComponentProps>) {
  const { default: isDefaultProp, name } = props
  const { experiment, siteName, state: banditState } = useContext(InstantBanditContext)
  const [scopeState, setScopeState] = useState<Scope>(
    () => Object.assign({}, DEFAULT_SCOPE_CONTEXT, {
      experiment,
      siteName: siteName,
    } as Scope))

  // TODO: Test scope and scope transitions

  const isDefault = !!isDefaultProp
  const isSelected = (experiment && experiment.name === name)
  const notReady = banditState !== LoadState.READY

  function shouldBePresent() {
    return isSelected || (isDefault && notReady)
  }

  const present = shouldBePresent()
  return (
    <ScopeContext.Provider value={scopeState}>
      {present && props.children}
    </ScopeContext.Provider>
  )
}
