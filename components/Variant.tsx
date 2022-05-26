import { PropsWithChildren, useContext, useState } from "react"
import { DEFAULT_VARIANT } from "../lib/constants"
import { DEFAULT_SCOPE_CONTEXT, InstantBanditContext, LoadState, Scope, ScopeContext } from "../lib/contexts"


export interface VariantProps {
  name?: string
  default?: boolean
}

/**
 * Groups one or more components and their children into a block that can be conditionally
 * and/or lazily loaded on the fly as part of an experiment.
 * 
 * A Variant with no name or the name "default" is considered to be a "invariant".
 * 
 * @param props 
 * @returns 
 */
export function Variant(props: PropsWithChildren<VariantProps>) {
  const { default: invariantProp, name } = props
  const { variant, siteName, state: banditState } = useContext(InstantBanditContext)

  const [scopeState, setScopeState] = useState<Scope>(
    () => Object.assign({}, DEFAULT_SCOPE_CONTEXT, {
      variant,
      siteName,
    } as Scope))

  const isInvariant = !!invariantProp
  const isSelected = (variant && variant.name === name)
  const notReady = banditState !== LoadState.READY

  const present = isSelected || (isInvariant && notReady)
  return (
    <ScopeContext.Provider value={scopeState}>
      {present && props.children}
    </ScopeContext.Provider>
  )
}

export interface InvariantProps {
  show?: boolean
}

/**
 * An Invariant is rendered when no other variant matches
 * @param props 
 * @returns 
 */
export const Invariant: React.FC<InvariantProps> = (props) => {
  return (
    <Variant name={DEFAULT_VARIANT}>
      {props.children}
    </Variant>
  )
}