import { PropsWithChildren, useContext, useEffect, useState } from "react"
import { DEFAULT_SCOPE_CONTEXT, InstantBanditContext, InstantBanditLoadState, InstantBanditScope, ScopeContext } from "../lib/contexts"


export interface ExperimentComponentProps {
  name: string
}

export function Experiment(props: PropsWithChildren<ExperimentComponentProps>) {
  const { experiment, state: banditState, options: settings, site } = useContext(InstantBanditContext)
  const [scopeState, setScopeState] = useState<InstantBanditScope>(DEFAULT_SCOPE_CONTEXT)


  useEffect(() => {
    if (banditState !== InstantBanditLoadState.READY) return
    if (!experiment) return

    console.debug(`[IB] Experiment effect`, scopeState)

    const chain = [...scopeState.scope, experiment!.name]
    setScopeState({ ...scopeState, scope: chain })

  }, [banditState, experiment, settings])


  return (
    <ScopeContext.Provider value={scopeState}>
      {props.children}
    </ScopeContext.Provider>
  )
}
